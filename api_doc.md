# Datonix AEC — Frontend API Specification

**Audience:** Backend team  
**Version:** 1.0  
**Date:** 2026-06-20  
**Frontend repo:** `datonix-ai`  


---

## 1. Overview

The AEC module is a full operating workflow:

```
Enterprise Twin → Inquiries → Projects → WBS → Timesheets/Expenses → Accounting → Dashboards/Agents
```

All AEC routes should be scoped by:

| Scope | Description |
|-------|-------------|
| **Tenant** | From auth token (existing PX1 multi-tenant model) |
| **Enterprise Twin** | User may have multiple twins (e.g. Meridian Group, Horizon Consultants) |
| **Entity** | Business unit within a twin: `MA`, `ME`, `MC`, `MC+MA` |

### Base URL

```
{VITE_API_BASE_URL}   # e.g. http://localhost:7003
```

### Recommended AEC prefix

```
/api/v1/aec
```

---

## 2. Authentication & Headers

### 2.1 Login (existing — reuse)

**`POST /auth/login`**

Request:
```json
{
  "email": "victoria@meridianarchitects.com",
  "password": "datonix2026"
}
```

Response:
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": 42,
    "username": "victoria",
    "email": "victoria@meridianarchitects.com",
    "role": "aec_manager",
    "tenant": { "id": 1, "name": "Meridian Group" },
    "organization": { "id": 3, "name": "Meridian Architecture" }
  }
}
```

### 2.2 Required headers on all AEC requests

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | `Bearer {accessToken}` |
| `X-User-Id` | Yes | Logged-in user ID (frontend already sends this) |
| `X-Twin-Id` | Yes* | Active enterprise twin ID (e.g. `meridian-group`) |
| `Content-Type` | Yes (JSON bodies) | `application/json` |

\*Except `GET /api/v1/aec/twins` (list all twins for user).

### 2.3 AEC roles (for RBAC)

Frontend expects role-based views. Map Django roles to:

| Role | Frontend behaviour |
|------|-------------------|
| `aec_employee` | My Dashboard, submit timesheet/expense |
| `aec_manager` | + approvals (timesheets, expenses, leave), team view |
| `aec_director` | + executive dashboard, agent governance |
| `aec_admin` | + twin management, rate cards, admin console |

Admin console continues to use existing `/admin/*` routes (PX1 pattern).

---

## 3. Response Conventions

### 3.1 Standard success envelope (preferred)

```json
{
  "status": "success",
  "data": { }
}
```

For lists:
```json
{
  "status": "success",
  "data": [ ],
  "meta": {
    "total": 8,
    "page": 1,
    "pageSize": 25
  }
}
```

Frontend also accepts bare arrays or `{ results: [] }` via `normalizeList()` — but **prefer the envelope above** for new AEC APIs.

### 3.2 Standard error envelope

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required",
    "details": [
      { "field": "name", "message": "This field is required" }
    ]
  }
}
```

HTTP status codes: `400` validation, `401` unauth, `403` forbidden, `404` not found, `409` conflict, `422` business rule, `500` server.

### 3.3 Common query parameters

| Param | Type | Used on |
|-------|------|---------|
| `entity` | `MA\|ME\|MC` | List filters |
| `status` | string | Pending/Approved filters |
| `page` | int | Pagination |
| `pageSize` | int | Pagination (default 25) |
| `from` / `to` | ISO date | Date range filters |

---

## 4. Enterprise Twin (Week 1)

### 4.1 List twins

**`GET /api/v1/aec/twins`**

Response `data`:
```json
[
  {
    "id": "meridian-group",
    "name": "Meridian Group",
    "status": "Live",
    "staffCount": 83,
    "projectCount": 87,
    "reportingCurrency": "GBP",
    "description": "Multi-entity AEC holding company across UK and UAE operations.",
    "prompt": "Meridian Group is a multi-entity AEC holding company...",
    "generatedAt": "2026-03-15T09:42:00Z",
    "entities": [
      {
        "id": "ma",
        "code": "MA",
        "name": "Meridian Architecture",
        "staffCount": 40,
        "region": "UK",
        "currency": "GBP",
        "status": "Active"
      }
    ]
  }
]
```

### 4.2 Generate twin from prompt (LLM)

**`POST /api/v1/aec/twins/generate`**

Request:
```json
{
  "prompt": "We are a 40-person architecture firm. We use QuickBooks and Excel. We manage 120 projects annually."
}
```

Response `data`:
```json
{
  "twin": { /* EnterpriseTwinSummary — same shape as 4.1 */ },
  "layers": {
    "org": { "hierarchyLevels": 5, "businessUnits": 8, "entities": 3 },
    "resource": { "avgUtilization": 73, "benchCount": 6, "overAllocated": 2 },
    "financial": { "marginPct": 34, "employeeCostGbp": 186000, "contractorCostGbp": 41000 },
    "operational": { "activeProjects": 87, "crossEntityProjects": 4, "unmetRoles": 3 }
  },
  "kpiFramework": [
    {
      "id": "financial",
      "category": "Financial KPIs",
      "items": "Revenue, Employee/Contractor Cost Split, Gross Margin, AR Days"
    }
  ],
  "connectors": [ /* see 4.4 */ ],
  "agents": [ /* see 4.5 */ ],
  "metadata": {
    "version": "1.0.0",
    "dataSources": ["QuickBooks", "Excel"],
    "extractionMappings": [
      {
        "source": "QuickBooks",
        "targetModule": "AR / AP / GL",
        "fields": [
          { "sourceField": "Invoice.Amount", "targetField": "invoice.amount_gbp", "coRelevance": ["Ajera.ProjectCode"] }
        ]
      }
    ]
  }
}
```

> **Note:** Twin generation is async in production. Return `202` with `{ jobId }` and poll `GET /api/v1/aec/twins/generate/{jobId}` if generation takes >3s.

### 4.3 Get twin detail

**`GET /api/v1/aec/twins/{twinId}`**

Returns full twin + layers + KPIs + connectors + agents (same as generate response).

### 4.4 Connectors

**`GET /api/v1/aec/twins/{twinId}/connectors`**

Response `data`:
```json
[
  {
    "id": "qb",
    "source": "QuickBooks",
    "connector": "Acctg Connector",
    "targetModule": "AR / AP / GL",
    "status": "Live",
    "entities": "MA · ME",
    "lastSync": "2026-03-15T10:40:00Z",
    "coverage": "94%",
    "recordsMapped": 12400
  }
]
```

**`POST /api/v1/aec/twins/{twinId}/connectors/{connectorId}/sync`** — trigger sync job.

### 4.5 Generated agents (twin-level)

**`GET /api/v1/aec/twins/{twinId}/agents`**

Response `data`:
```json
[
  {
    "id": "margin-erosion",
    "name": "Margin Erosion Monitor",
    "trigger": "Project margin drops below 12%",
    "layer": "Financial",
    "status": "Active",
    "lastRun": "2026-03-15T08:00:00Z",
    "confidence": 89
  }
]
```

### 4.6 KPI framework

**`GET /api/v1/aec/twins/{twinId}/kpis`**

Response `data`:
```json
{
  "categories": [
    { "id": "financial", "category": "Financial KPIs", "items": "Revenue, Gross Margin, AR Days" }
  ],
  "items": [
    {
      "id": "margin",
      "name": "Group Gross Margin",
      "category": "Financial",
      "target": "32%",
      "actual": "34%",
      "status": "On Track",
      "layer": "Financial"
    }
  ]
}
```

`status` enum: `On Track` | `At Risk` | `Behind`

### 4.7 Org chart

**`GET /api/v1/aec/twins/{twinId}/org-chart`**

Response `data` — nested tree:
```json
{
  "id": "dc",
  "initials": "DC",
  "name": "David Chen",
  "type": "IN-HOUSE",
  "title": "CEO / Managing Director",
  "entity": "MG",
  "email": "david.chen@meridianarchitects.com",
  "costRate": "—",
  "billRate": "—",
  "utilization": 45,
  "allocation": "Executive",
  "projects": [],
  "children": [ /* OrgMember[] */ ]
}
```

`type` enum: `IN-HOUSE` | `CONTRACTOR` | `FREELANCER`

### 4.8 Data ingestion

**`GET /api/v1/aec/twins/{twinId}/ingestion`**

Returns connector status + data flow stages (sources → connectors → modules).

**`POST /api/v1/aec/twins/{twinId}/ingestion/upload`**

`multipart/form-data`:
- `file` — CSV/Excel
- `targetModule` — e.g. `Timesheets`
- `entity` — optional entity code

Response:
```json
{
  "status": "success",
  "data": {
    "jobId": "ing-123",
    "rowsParsed": 840,
    "rowsImported": 812,
    "rowsSkipped": 28,
    "errors": []
  }
}
```

---

## 5. Customer Inquiries & Pipeline (Week 2)

### 5.1 List inquiries

**`GET /api/v1/aec/twins/{twinId}/inquiries`**

Query: `entity`, `stage`, `scoreMin`, `scoreMax`, `page`, `pageSize`

Response `data`:
```json
[
  {
    "id": "inq-holborn",
    "client": "Holborn Partners",
    "projectName": "Kings Cross Tower",
    "entity": "MA",
    "projectType": "Commercial",
    "stage": "Proposal",
    "stageLabel": "Proposal Due",
    "score": 94,
    "valueGbp": 220000,
    "valueDisplay": "£220K",
    "contact": "Sarah Mitchell",
    "receivedDate": "2026-02-18",
    "suggestedAction": "Generate Proposal"
  }
]
```

`stage` enum: `Inquiry` | `Qualification` | `Proposal` | `Negotiation` | `Won` | `Lost`

### 5.2 Inquiry metrics (dashboard strip)

**`GET /api/v1/aec/twins/{twinId}/inquiries/metrics`**

Response `data`:
```json
{
  "activeInquiries": 8,
  "proposals": 3,
  "pipelineGbp": 840000,
  "winRatePct": 62
}
```

### 5.3 Generate proposal

**`POST /api/v1/aec/twins/{twinId}/inquiries/{inquiryId}/proposal`**

Request (optional overrides):
```json
{
  "templateType": "standard"
}
```

Response `data`:
```json
{
  "title": "Proposal — Kings Cross Tower",
  "client": "Holborn Partners",
  "entity": "MA",
  "type": "Commercial",
  "value": "£220K",
  "sections": [
    "Executive Summary",
    "Scope of Services",
    "Team & Qualifications",
    "Fee Proposal & Schedule",
    "Terms & Assumptions"
  ],
  "summary": "Datonix MA proposes commercial services for Holborn Partners..."
}
```

### 5.4 Generate quotation

**`POST /api/v1/aec/twins/{twinId}/inquiries/{inquiryId}/quotation`**

Response `data`:
```json
{
  "title": "Quotation — Kings Cross Tower",
  "reference": "QT-MA-HOLB",
  "client": "Holborn Partners",
  "entity": "MA",
  "validUntil": "2026-04-30",
  "currency": "GBP",
  "lineItems": [
    { "description": "Professional fees — concept & design", "amount": 121000, "unit": "Lump sum" },
    { "description": "Disbursements & surveys", "amount": 33000, "unit": "Estimate" },
    { "description": "Project management & coordination", "amount": 66000, "unit": "Lump sum" }
  ],
  "total": 220000,
  "terms": "Fees exclusive of VAT. Quotation valid 30 days."
}
```

### 5.5 Convert inquiry → project

**`POST /api/v1/aec/twins/{twinId}/inquiries/{inquiryId}/convert`**

Response `data`:
```json
{
  "projectId": "prj-kings-cross",
  "draft": {
    "name": "Kings Cross Tower",
    "client": "Holborn Partners",
    "entity": "MA",
    "type": "Commercial",
    "billingType": "Lump Sum",
    "currency": "GBP",
    "budget": 220000,
    "startDate": "2026-04-01",
    "endDate": "2027-12-31",
    "projectManager": "Sarah Mitchell"
  }
}
```

---

## 6. Projects & WBS (Week 2)

### 6.1 List projects (portfolio)

**`GET /api/v1/aec/twins/{twinId}/projects`**

Query: `entity`, `billingType`, `health`, `page`, `pageSize`

Response `data`:
```json
[
  {
    "id": "prj-kings-cross",
    "name": "Kings Cross Tower",
    "client": "Holborn Partners",
    "entity": "MA",
    "type": "Commercial",
    "billingType": "Lump Sum",
    "currency": "GBP",
    "budget": 310000,
    "budgetDisplay": "£310K",
    "revenue": 480000,
    "revenueDisplay": "£480K",
    "health": "Good",
    "marginPct": 35,
    "progressPct": 64,
    "projectManager": "P. Sharma",
    "costs": {
      "employee": 198000,
      "contractor": 72000,
      "freelancer": 28000,
      "other": 42000
    }
  }
]
```

`billingType`: `Lump Sum` | `Milestone` | `T&M`  
`health`: `Good` | `At Risk` | `Critical`

### 6.2 Create / update project

**`POST /api/v1/aec/twins/{twinId}/projects`**  
**`PATCH /api/v1/aec/twins/{twinId}/projects/{projectId}`**

Request:
```json
{
  "name": "Kings Cross Tower",
  "client": "Holborn Partners",
  "entity": "MA",
  "type": "Commercial",
  "billingType": "Lump Sum",
  "currency": "GBP",
  "budget": 310000,
  "startDate": "2026-04-01",
  "endDate": "2027-12-31",
  "projectManager": "P. Sharma"
}
```

Response `data`: full `Project` object (6.1 shape).

### 6.3 AI team recommendations

**`GET /api/v1/aec/twins/{twinId}/projects/recommendations`**

Query: `projectType`, `entity`

Response `data`:
```json
{
  "projectManagers": [
    { "name": "Priya Sharma", "role": "Project Manager", "score": 94, "rationale": "Led Kings Cross Tower concept; 92% on-time delivery." }
  ],
  "architects": [
    { "name": "Alex Chen", "role": "Lead Architect", "score": 91, "rationale": "Commercial tower specialist; available from April." }
  ]
}
```

### 6.4 Project profitability

**`GET /api/v1/aec/twins/{twinId}/projects/{projectId}/profitability`**

Response `data`:
```json
{
  "project": { /* Project object */ },
  "statement": [
    { "line": "Revenue (billed to date)", "amount": 480000, "type": "revenue" },
    { "line": "Employee costs", "amount": -198000, "type": "cost" },
    { "line": "Gross profit", "amount": 140000, "type": "total" },
    { "line": "Gross margin", "amount": 35, "type": "margin" }
  ],
  "costLogic": [
    { "resource": "In-house architect (Senior)", "rate": "£85/hr", "hours": 1240, "total": "£105,400", "logic": "Rate card v3.2 — MA entity" }
  ],
  "recommendations": [
    { "scenario": "Core design team", "recommendation": "In-house", "saving": "12% vs contractor", "reason": "Utilization headroom in MA studio" }
  ]
}
```

### 6.5 WBS — get

**`GET /api/v1/aec/twins/{twinId}/projects/{projectId}/wbs`**

Response `data`:
```json
{
  "id": "prj-kings-cross",
  "name": "Kings Cross Tower",
  "riskSignal": {
    "severity": "High",
    "title": "AI Risk Signal — Schedule Risk",
    "message": "Phase 3 · Planning Submission at 64% with +3d variance.",
    "recommendation": "Add 1 structural engineer from ME for 4 weeks."
  },
  "phases": [
    {
      "id": "ph-3",
      "name": "Phase 3 · Planning Submission",
      "status": "In Progress",
      "progress": 64,
      "budgetGbp": 72000,
      "spentGbp": 46000,
      "tasks": [
        {
          "id": "t-3-1",
          "name": "3.1 Planning Drawings",
          "progress": 64,
          "children": ["3.1.1 Elevations", "3.1.2 Floor Plans"]
        }
      ]
    }
  ],
  "milestones": [
    {
      "id": "ms-3",
      "name": "Planning Submission",
      "phase": "Phase 3",
      "plannedDate": "2026-06-30",
      "actualDate": null,
      "varianceDays": 0,
      "status": "On Track"
    }
  ]
}
```

### 6.6 WBS — AI generate draft

**`POST /api/v1/aec/twins/{twinId}/projects/{projectId}/wbs/generate`**

Request:
```json
{
  "billingType": "Lump Sum",
  "budget": 310000,
  "projectType": "Commercial"
}
```

Response: same shape as 6.5 (draft WBS, status `Draft` until approved).

### 6.7 WBS — approve

**`POST /api/v1/aec/twins/{twinId}/projects/{projectId}/wbs/approve`**

Request:
```json
{
  "approvedBy": "Victoria Hayes",
  "notes": "Approved for mobilisation"
}
```

---

## 7. Resources (Week 3)

### 7.1 List resources

**`GET /api/v1/aec/twins/{twinId}/resources`**

Query: `entity`, `type`, `status`

Response `data`:
```json
[
  {
    "id": "EMP-005",
    "name": "Sarah Mitchell",
    "type": "IN-HOUSE",
    "entity": "MA",
    "designation": "Director",
    "department": "Architecture",
    "costRate": "£95/h",
    "billRate": "£165/h",
    "utilization": 78,
    "status": "Good",
    "projects": ["Kings Cross Tower", "Camden Housing"]
  }
]
```

`status` enum: `Over` | `Good` | `Bench` | `At Risk`

### 7.2 Resource summary (metrics strip)

**`GET /api/v1/aec/twins/{twinId}/resources/summary`**

Response `data`:
```json
{
  "inHouse": 71,
  "contractors": 8,
  "freelancers": 4,
  "avgUtilization": 73,
  "capacityRisk": 2,
  "benchCount": 6
}
```

### 7.3 Create resource

**`POST /api/v1/aec/twins/{twinId}/resources`**

Request:
```json
{
  "name": "Alex Chen",
  "type": "IN-HOUSE",
  "entity": "MA",
  "designation": "Sr. Architect",
  "department": "Architecture",
  "costRate": "£65/hr",
  "billRate": "£110/hr",
  "contractExpiry": null
}
```

Response `data`: full `ResourceRecord`.

### 7.4 Utilization heatmap

**`GET /api/v1/aec/twins/{twinId}/resources/utilization`**

Query: `weeks` (default 12)

Response `data`:
```json
{
  "weeks": ["W20", "W21", "W22", "W23", "W24"],
  "rows": [
    { "name": "Priya Sharma", "entity": "MA", "values": [82, 88, 91, 94, 94] }
  ]
}
```

### 7.5 Cross-entity allocation

**`GET /api/v1/aec/twins/{twinId}/resources/allocations`**

Response `data`:
```json
[
  {
    "resource": "Priya Sharma",
    "homeEntity": "MA",
    "allocatedEntity": "MC",
    "project": "Dubai Marina Dev.",
    "allocationPct": 20,
    "period": "Q2 2026"
  }
]
```

### 7.6 Skills matrix

**`GET /api/v1/aec/twins/{twinId}/resources/skills`**

Response `data`:
```json
{
  "byEntity": [
    { "entity": "MA", "skills": ["BIM", "Commercial Design", "Urban Planning"], "coverage": 82 }
  ],
  "individuals": [
    { "name": "Alex Chen", "role": "Sr. Architect", "entity": "MA", "skills": [{ "name": "BIM", "rating": 5 }] }
  ]
}
```

### 7.7 Rate cards

**`GET /api/v1/aec/twins/{twinId}/rate-cards`**

Query: `type` (`IN-HOUSE` | `CONTRACTOR` | `FREELANCER`), `entity`

Response `data`:
```json
[
  {
    "id": "rh-2",
    "role": "Sr. Architect",
    "entity": "MA",
    "type": "IN-HOUSE",
    "costRate": "£65/hr",
    "billRate": "£110/hr",
    "effectiveFrom": "2026-01-01",
    "status": "Active"
  }
]
```

**`GET /api/v1/aec/twins/{twinId}/rate-cards/revisions`** — revision history.

**`POST /api/v1/aec/twins/{twinId}/rate-cards/revisions/{revisionId}/approve`** — CFO approval.

---

## 8. Timesheets (Week 3)

### 8.1 List timesheet submissions (manager view)

**`GET /api/v1/aec/twins/{twinId}/timesheets`**

Query: `status` (`Pending` | `Approved` | `Rejected`), `week`, `entity`, `employeeId`

Response `data`:
```json
[
  {
    "id": "ts-1",
    "employee": "Priya Sharma",
    "employeeId": "EMP-002",
    "entity": "MA",
    "week": "Week 24",
    "weekStart": "2026-03-10",
    "weekEnd": "2026-03-14",
    "totalHours": 42,
    "billableHours": 38,
    "projects": "Kings Cross Tower",
    "status": "Pending"
  }
]
```

### 8.2 Get timesheet detail (weekly grid)

**`GET /api/v1/aec/twins/{twinId}/timesheets/{timesheetId}`**

Response `data`:
```json
{
  "id": "ts-1",
  "employee": "Priya Sharma",
  "week": "Week 24",
  "status": "Pending",
  "rows": [
    {
      "projectId": "prj-kings-cross",
      "project": "Kings Cross Tower",
      "task": "Planning drawings",
      "wbsId": "t-3-1",
      "mon": 6, "tue": 7, "wed": 8, "thu": 6, "fri": 5
    }
  ]
}
```

### 8.3 Submit timesheet

**`POST /api/v1/aec/twins/{twinId}/timesheets`**

Request:
```json
{
  "weekStart": "2026-03-10",
  "weekEnd": "2026-03-14",
  "rows": [
    {
      "projectId": "prj-kings-cross",
      "wbsId": "t-3-1",
      "task": "Planning drawings",
      "mon": 6, "tue": 7, "wed": 8, "thu": 6, "fri": 5,
      "billable": true
    }
  ]
}
```

Response `data`: created `TimesheetSubmission` with `status: "Pending"`.

### 8.4 Approve / reject timesheet

**`POST /api/v1/aec/twins/{twinId}/timesheets/{timesheetId}/approve`**  
**`POST /api/v1/aec/twins/{twinId}/timesheets/{timesheetId}/reject`**

Reject request:
```json
{ "reason": "Hours exceed daily limit on Wednesday" }
```

### 8.5 Bulk approve

**`POST /api/v1/aec/twins/{twinId}/timesheets/bulk-approve`**

Request:
```json
{ "timesheetIds": ["ts-1", "ts-2", "ts-3"] }
```

### 8.6 Upload timesheet file (CSV/Excel)

**`POST /api/v1/aec/twins/{twinId}/timesheets/upload`**

`multipart/form-data`: `file`

Response:
```json
{
  "status": "success",
  "data": {
    "draftEntries": 42,
    "duplicatesFlagged": 3,
    "parseErrors": [],
    "previewId": "ts-preview-abc"
  }
}
```

---

## 9. Expenses (Week 3)

### 9.1 List expenses

**`GET /api/v1/aec/twins/{twinId}/expenses`**

Query: `status` (`Pending` | `Approved` | `Rejected`)

Response `data`:
```json
[
  {
    "id": "exp-1",
    "employee": "James Okafor",
    "employeeId": "EMP-003",
    "entity": "MA",
    "category": "Travel",
    "amount": 84.5,
    "currency": "GBP",
    "project": "Kings Cross Tower",
    "projectId": "prj-kings-cross",
    "date": "2026-03-14",
    "description": "Client site visit — Holborn",
    "status": "Pending"
  }
]
```

`category` enum: `Travel` | `Software` | `Materials` | `Subsistence` | `Other`

### 9.2 Submit expense

**`POST /api/v1/aec/twins/{twinId}/expenses`**

Request:
```json
{
  "date": "2026-03-15",
  "category": "Software",
  "amount": 249,
  "currency": "GBP",
  "projectId": "prj-kings-cross",
  "description": "AutoCAD LT licence renewal"
}
```

Optional: `receipt` file via `multipart/form-data`.

### 9.3 Approve / reject expense

**`POST /api/v1/aec/twins/{twinId}/expenses/{expenseId}/approve`**  
**`POST /api/v1/aec/twins/{twinId}/expenses/{expenseId}/reject`**

---

## 10. Leave & Downtime (Week 3)

### 10.1 List leave requests

**`GET /api/v1/aec/twins/{twinId}/leave`**

Query: `status` (`Pending` | `Approved` | `Rejected`)

Response `data`:
```json
[
  {
    "id": "lv-1",
    "employee": "Alex Chen",
    "employeeId": "EMP-001",
    "entity": "MA",
    "type": "Annual Leave",
    "startDate": "2026-04-14",
    "endDate": "2026-04-18",
    "days": 5,
    "status": "Pending",
    "impact": "Medium — Kings Cross Tower design review may shift"
  }
]
```

`type` enum: `Annual Leave` | `Sick Leave` | `Unpaid Leave` | `Resignation Notice`

### 10.2 Submit leave request

**`POST /api/v1/aec/twins/{twinId}/leave`**

Request:
```json
{
  "type": "Annual Leave",
  "startDate": "2026-04-14",
  "endDate": "2026-04-18"
}
```

Backend should compute `impact` string based on project allocations.

### 10.3 Approve / reject leave

**`POST /api/v1/aec/twins/{twinId}/leave/{leaveId}/approve`**  
**`POST /api/v1/aec/twins/{twinId}/leave/{leaveId}/reject`**

---

## 11. Accounting (Week 4)

### 11.1 Accounting overview metrics

**`GET /api/v1/aec/twins/{twinId}/accounting/summary`**

Response `data`:
```json
{
  "arOutstandingGbp": 218500,
  "apDueGbp": 45200,
  "overdueInvoiceCount": 1,
  "glEntriesMtd": 5
}
```

### 11.2 Invoices (AR)

**`GET /api/v1/aec/twins/{twinId}/invoices`**

Query: `status`, `entity`, `client`

Response `data`:
```json
[
  {
    "id": "INV-MA-039",
    "entity": "MA",
    "client": "Holborn Partners",
    "project": "Kings Cross Tower",
    "projectId": "prj-kings-cross",
    "amountGbp": 48000,
    "daysOutstanding": 65,
    "status": "Escalate",
    "dueDate": "2026-01-15"
  }
]
```

`status` enum: `Paid` | `Pending` | `Overdue` | `Escalate`

### 11.3 Create invoice

**`POST /api/v1/aec/twins/{twinId}/invoices`**

Request:
```json
{
  "entity": "MA",
  "client": "Holborn Partners",
  "projectId": "prj-kings-cross",
  "type": "Milestone",
  "currency": "GBP",
  "netAmount": 48000,
  "dueDate": "2026-04-15"
}
```

Response `data`: full `Invoice` + computed VAT:
```json
{
  "invoice": { /* Invoice object */ },
  "taxRule": "UK VAT 20%",
  "vatAmount": 9600,
  "grossAmount": 57600
}
```

> Invoices should be generatable from approved timesheets/expenses:
> **`POST /api/v1/aec/twins/{twinId}/invoice-batches/generate`**
> Request: `{ "periodStart": "2026-03-01", "periodEnd": "2026-03-31", "projectIds": [] }`

### 11.4 Accounts payable

**`GET /api/v1/aec/twins/{twinId}/accounting/ap`**

Response `data`:
```json
[
  {
    "id": "AP-1021",
    "vendor": "Klein & Partners",
    "entity": "ME",
    "amountGbp": 12400,
    "status": "Due",
    "dueDate": "2026-03-25"
  }
]
```

### 11.5 General ledger

**`GET /api/v1/aec/twins/{twinId}/accounting/gl`**

Query: `from`, `to`, `entity`

Response `data`:
```json
[
  {
    "id": "GL-8841",
    "date": "2026-03-14",
    "account": "4100 · Project Revenue",
    "description": "Kings Cross milestone billing",
    "debit": null,
    "credit": 48000,
    "source": "Invoice Auto",
    "entity": "MA"
  }
]
```

### 11.6 Payroll inputs

**`GET /api/v1/aec/twins/{twinId}/accounting/payroll`**

Query: `period` (e.g. `2026-03`)

Response `data`:
```json
[
  {
    "id": "pay-1",
    "name": "Priya Sharma",
    "entity": "MA",
    "type": "UK PAYE",
    "amountGbp": 6200,
    "period": "Mar 2026",
    "note": null
  }
]
```

### 11.7 Currency / FX

**`GET /api/v1/aec/twins/{twinId}/currency`**

Response `data`:
```json
{
  "reportingCurrency": "GBP",
  "rates": [
    { "pair": "AED/GBP", "rate": 0.215, "asOf": "2026-03-15" }
  ],
  "exposureGbp": 218000,
  "fxPnlGbp": -14000,
  "projectImpacts": [
    { "project": "Dubai Marina Dev.", "entity": "MC", "exposureGbp": 218000, "marginImpactPct": -1.2 }
  ]
}
```

---

## 12. Dashboards & Reports (Week 4)

### 12.1 Nav badge counts

**`GET /api/v1/aec/twins/{twinId}/badges`**

Response `data`:
```json
{
  "inquiries": 8,
  "timesheets": 4,
  "expenses": 2,
  "leave": 1,
  "agents": 6
}
```

Frontend uses this for sidebar notification badges.

### 12.2 My dashboard (individual / manager)

**`GET /api/v1/aec/twins/{twinId}/dashboard/my`**

Query: `view` (`individual` | `team`) — manager only for `team`

Response `data`:
```json
{
  "utilizationPct": 82,
  "leaveBalanceDays": 12,
  "myProjects": [
    { "name": "Kings Cross Tower", "role": "Lead Architect", "progress": 64, "health": "Good" }
  ],
  "pendingApprovals": [
    { "type": "TS", "label": "Timesheets pending", "count": 4 },
    { "type": "EXP", "label": "Expenses pending", "count": 2 },
    { "type": "Leave", "label": "Leave requests", "count": 1 }
  ],
  "agentNotifications": [
    { "agent": "Project Delay Sentinel", "message": "Planning submission +3d variance", "time": "1h ago" }
  ],
  "teamUtilization": [
    { "name": "Priya Sharma", "utilization": 94, "entity": "MA" }
  ]
}
```

`teamUtilization` only populated when `view=team`.

### 12.3 Executive dashboard

**`GET /api/v1/aec/twins/{twinId}/dashboard/executive`**

Response `data`:
```json
{
  "kpis": {
    "groupRevenueGbp": 2410000,
    "groupMarginPct": 34,
    "projectsAtRisk": 11,
    "activeProjects": 87,
    "staffCount": 83,
    "avgUtilization": 73,
    "arDaysOutstanding": 52,
    "cashRunwayDays": 94
  },
  "revenueByEntity": [
    { "entity": "MA", "revenueGbp": 1420000, "marginPct": 35 }
  ],
  "costComposition": [
    { "category": "Employee", "amountGbp": 186000, "pct": 62 }
  ],
  "utilizationTrend": [
    { "month": "Mar", "value": 73 }
  ],
  "alerts": [
    {
      "id": "a1",
      "severity": "High",
      "title": "INV-MA-039 overdue 65+ days",
      "message": "Holborn Partners invoice £48K requires escalation.",
      "agent": "AR Collection Agent",
      "time": "2026-03-15T08:00:00Z"
    }
  ]
}
```

### 12.4 Reports library

**`GET /api/v1/aec/twins/{twinId}/reports`**

Response `data`:
```json
[
  {
    "id": "rpt-profit",
    "name": "Project Profitability",
    "category": "Financial",
    "description": "Margin and P&L by project across MA, ME, MC",
    "icon": "chart",
    "lastRun": "2026-03-15T09:00:00Z"
  }
]
```

### 12.5 Run report

**`POST /api/v1/aec/twins/{twinId}/reports/{reportId}/run`**

Request:
```json
{
  "entity": "MA",
  "from": "2026-01-01",
  "to": "2026-03-31"
}
```

Response `data`:
```json
{
  "reportId": "rpt-profit",
  "generatedAt": "2026-03-15T10:00:00Z",
  "rows": [
    {
      "id": "1",
      "entity": "MA",
      "project": "Kings Cross Tower",
      "metric": "Gross Margin",
      "value": "35%",
      "status": "Good"
    }
  ]
}
```

---

## 13. AI Agent Governance (Week 4)

### 13.1 List governance agents (pending actions)

**`GET /api/v1/aec/twins/{twinId}/agents/governance`**

Query: `status` (`Pending` | `Approve` | `Modify` | `Reject`)

Response `data`:
```json
[
  {
    "id": "delay",
    "name": "Project Delay Sentinel",
    "trigger": "Milestone variance > 5 days",
    "recommendation": "Add 1 structural engineer from ME for 4 weeks on Kings Cross Tower Phase 3.",
    "confidence": 91,
    "status": "Pending",
    "project": "Kings Cross Tower",
    "projectId": "prj-kings-cross",
    "entity": "MA"
  }
]
```

### 13.2 Agent action (human-in-the-loop)

**`POST /api/v1/aec/twins/{twinId}/agents/governance/{agentId}/action`**

Request:
```json
{
  "action": "Approve",
  "notes": "Proceed with cross-entity assignment",
  "modifiedRecommendation": null
}
```

`action` enum: `Approve` | `Modify` | `Reject`

Response `data`:
```json
{
  "agent": { /* updated GovernanceAgent */ },
  "auditEntry": {
    "id": "log-99",
    "timestamp": "2026-03-15T10:42:00Z",
    "agent": "Project Delay Sentinel",
    "action": "Approve",
    "user": "Victoria Hayes",
    "detail": "Approve: Add 1 structural engineer..."
  }
}
```

### 13.3 Agent audit log

**`GET /api/v1/aec/twins/{twinId}/agents/audit-log`**

Query: `page`, `pageSize`, `from`, `to`

Response `data`: array of `AuditLogEntry`.

---

## 14. Cross-Cutting Endpoints

### 14.1 Workspace bootstrap (recommended)

Single call on app load / twin switch to reduce round-trips:

**`GET /api/v1/aec/twins/{twinId}/workspace`**

Response `data`:
```json
{
  "twin": { },
  "badges": { },
  "inquiryMetrics": { },
  "inquiries": [ ],
  "projects": [ ],
  "timesheetSubmissions": [ ],
  "pendingExpenses": [ ],
  "invoices": [ ],
  "resources": [ ],
  "governanceAgents": [ ],
  "leaveRequests": [ ]
}
```

Frontend can hydrate `AecAppContext` from this one response, then lazy-load WBS/profitability per project.

### 14.2 Approval workflow config

**`GET /api/v1/aec/twins/{twinId}/approval-workflows`**

Returns step definitions for timesheets, expenses, invoices, agents, WBS (used by UI diagrams).

---

## 15. Implementation Priority

| Phase | Endpoints | Frontend screens unblocked |
|-------|-----------|--------------------------|
| **P0** | Auth (existing), `GET /twins`, `GET /workspace`, `GET /badges` | App shell, twin switcher, nav badges |
| **P1** | Twin generate, inquiries, projects, WBS | Pipeline flow end-to-end |
| **P2** | Resources, timesheets, expenses, leave | Operations & approvals |
| **P3** | Accounting, invoices, payroll, GL | Finance module |
| **P4** | Dashboards, reports, agent governance | Executive intelligence |
| **P5** | Ingestion upload, invoice-batch generate, exports | ERP integration |

---

## 16. Enums Reference

```typescript
// Inquiry
type InquiryStage = "Inquiry" | "Qualification" | "Proposal" | "Negotiation" | "Won" | "Lost";

// Project
type BillingType = "Lump Sum" | "Milestone" | "T&M";
type ProjectHealth = "Good" | "At Risk" | "Critical";
type ProjectEntity = "MA" | "ME" | "MC" | "MC+MA";

// Resource
type ResourceType = "IN-HOUSE" | "CONTRACTOR" | "FREELANCER";
type UtilizationStatus = "Over" | "Good" | "Bench" | "At Risk";

// Timesheet / Expense / Leave
type TimesheetStatus = "Pending" | "Approved" | "Rejected";
type ExpenseCategory = "Travel" | "Software" | "Materials" | "Subsistence" | "Other";
type LeaveType = "Annual Leave" | "Sick Leave" | "Unpaid Leave" | "Resignation Notice";
type LeaveStatus = "Pending" | "Approved" | "Rejected";

// Accounting
type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Escalate";

// Twin
type TwinStatus = "Live" | "Inactive" | "Draft";
type ConnectorStatus = "Live" | "Partial" | "Pending";

// Agents
type AgentAction = "Approve" | "Modify" | "Reject" | "Pending";
type AgentStatus = "Active" | "Paused" | "Draft";

// KPI
type KpiStatus = "On Track" | "At Risk" | "Behind";

// WBS
type PhaseStatus = "Complete" | "In Progress" | "Not Started";
type MilestoneStatus = "Complete" | "On Track" | "At Risk" | "Overdue";
type RiskSeverity = "High" | "Medium" | "Low";
```

---

## 17. Frontend Integration Notes

1. **TypeScript interfaces** live in `src/domains/aec/data/*.ts` — backend response fields should match these names (camelCase).
2. **Display fields** like `valueDisplay`, `budgetDisplay`, `revenueDisplay` can be computed server-side or client-side; frontend currently expects them on list views.
3. **Dates:** ISO 8601 (`2026-03-15` or full datetime). Relative times (`2h ago`) can be computed client-side from `lastRun` timestamps.
4. **Money:** Store amounts as numbers in base currency (GBP) unless entity is MC (AED); include `currency` field where multi-currency applies.
5. **IDs:** String slugs (e.g. `prj-kings-cross`) are fine for MVP; UUIDs also accepted if consistent.
6. **After backend is ready:** Frontend will replace `AecAppContext` localStorage with API calls in `src/common/api/aec.ts` (to be created).

---

## 18. Open Questions for Backend Team

| # | Question | Frontend assumption |
|---|----------|---------------------|
| 1 | Twin generation async job queue? | Poll or WebSocket for long-running LLM |
| 2 | Invoice from approved timesheets — auto or manual batch? | Manual batch with approval gate |
| 3 | Agent actions — can they trigger side effects (reassign resource)? | Human approves first; backend executes |
| 4 | File storage for receipts / timesheet uploads? | S3-compatible; return `fileId` |
| 5 | Multi-twin invoice consolidation? | Invoicing unified at project layer per twin |

---

**Contact:** Frontend team — share Postman collection or OpenAPI spec once endpoints are implemented.
