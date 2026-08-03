import type {
  ApEntry,
  GlJournalEntry,
  Invoice,
  InvoiceStatus,
  PayrollInput,
} from "@/domains/aec/data/accounting";
import type { FxRate, ProjectFxImpact } from "@/domains/aec/data/currency";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

export interface AccountingSummaryView {
  reportingCurrency: string;
  revenueYtd: number;
  revenueYtdDisplay: string;
  arOutstanding: number;
  arOutstandingDisplay: string;
  ar60Plus: number;
  ar60PlusDisplay: string;
  grossMarginPct: number;
}

export function mapAccountingSummary(raw: unknown): AccountingSummaryView {
  const o = asRecord(raw);
  return {
    reportingCurrency: String(o.reportingCurrency ?? "GBP"),
    revenueYtd: Number(o.revenueYtd ?? 0) || 0,
    revenueYtdDisplay: String(o.revenueYtdDisplay ?? "£0"),
    arOutstanding: Number(o.arOutstanding ?? 0) || 0,
    arOutstandingDisplay: String(o.arOutstandingDisplay ?? "£0"),
    ar60Plus: Number(o.ar60Plus ?? 0) || 0,
    ar60PlusDisplay: String(o.ar60PlusDisplay ?? "£0"),
    grossMarginPct: Number(o.grossMarginPct ?? 0) || 0,
  };
}

export function mapInvoiceStatus(raw: unknown, escalated?: boolean): InvoiceStatus {
  if (escalated) return "Escalate";
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("paid")) return "Paid";
  if (s.includes("overdue")) return "Overdue";
  if (s.includes("escalat")) return "Escalate";
  return "Pending";
}

export function mapInvoice(raw: unknown): Invoice {
  const o = asRecord(raw);
  const escalated = Boolean(o.escalated);
  return {
    id: String(o.id ?? ""),
    number: String(o.number ?? o.id ?? ""),
    entity: String(o.entityCode ?? o.entity ?? "—"),
    entityId: o.entityId != null ? String(o.entityId) : undefined,
    client: String(o.client ?? ""),
    project: String(o.project ?? "—"),
    projectId: o.projectId != null ? String(o.projectId) : undefined,
    amountGbp: Number(o.grossAmount ?? o.netAmount ?? o.amountGbp ?? 0) || 0,
    amountDisplay: o.amountDisplay != null ? String(o.amountDisplay) : undefined,
    daysOutstanding: Number(o.agingDays ?? o.daysOutstanding ?? 0) || 0,
    status: mapInvoiceStatus(o.status, escalated),
    dueDate: String(o.dueDate ?? ""),
    chaseRequested: Boolean(o.chaseRequested),
    escalated,
  };
}

export function mapApEntry(raw: unknown): ApEntry {
  const o = asRecord(raw);
  const statusRaw = String(o.status ?? "").toLowerCase();
  let status: ApEntry["status"] = "Pending";
  if (statusRaw.includes("paid")) status = "Paid";
  else if (statusRaw.includes("due") || statusRaw.includes("overdue") || statusRaw.includes("schedul")) {
    status = statusRaw.includes("paid") ? "Paid" : "Due";
  }
  return {
    id: String(o.id ?? o.reference ?? ""),
    vendor: String(o.supplier ?? o.vendor ?? ""),
    entity: String(o.entityCode ?? o.entity ?? "—"),
    amountGbp: Number(o.amount ?? 0) || 0,
    amountDisplay: o.amountDisplay != null ? String(o.amountDisplay) : undefined,
    status,
    dueDate: String(o.dueDate ?? ""),
  };
}

export function mapGlEntry(raw: unknown): GlJournalEntry {
  const o = asRecord(raw);
  return {
    id: String(o.id ?? ""),
    date: String(o.date ?? ""),
    account: String(o.account ?? `${o.accountCode ?? ""} · ${o.accountName ?? ""}`.trim()),
    description: String(o.description ?? ""),
    debit: o.debit != null ? Number(o.debit) : null,
    credit: o.credit != null ? Number(o.credit) : null,
    source: String(o.source ?? "—"),
    entity: String(o.entityCode ?? o.entity ?? "—"),
  };
}

/** GL list may be journals with nested lines or flat lines. */
export function mapGlList(raw: unknown): GlJournalEntry[] {
  const items = asArray(raw);
  const out: GlJournalEntry[] = [];
  for (const item of items) {
    const o = asRecord(item);
    if (Array.isArray(o.lines) || Array.isArray(o.rows)) {
      const lines = asArray(o.lines ?? o.rows);
      for (const line of lines) out.push(mapGlEntry(line));
    } else if (o.account || o.accountCode || o.debit != null || o.credit != null) {
      out.push(mapGlEntry(o));
    }
  }
  return out;
}

export function mapPayrollRows(raw: unknown, period: string): PayrollInput[] {
  const o = asRecord(raw);
  const rows = asArray(o.rows ?? raw);
  return rows.map((row, i) => {
    const r = asRecord(row);
    const onPayroll = r.onPayroll !== false && r.grossPay != null;
    const regime = String(r.regime ?? "").toUpperCase();
    let type: PayrollInput["type"] = "UK PAYE";
    if (!onPayroll) type = "Contractor";
    else if (regime.includes("WPS") || regime.includes("UAE")) type = "UAE WPS";
    return {
      id: String(r.resourceId ?? `pay-${i}`),
      name: String(r.employee ?? r.name ?? "—"),
      entity: String(r.entityCode ?? r.entity ?? "—"),
      type,
      amountGbp: Number(r.grossPay ?? r.amountGbp ?? 0) || 0,
      amountDisplay:
        r.grossPayDisplay != null
          ? String(r.grossPayDisplay)
          : r.notes
            ? String(r.notes)
            : undefined,
      period: String(o.period ?? period),
      note: r.notes != null ? String(r.notes) : r.note != null ? String(r.note) : undefined,
    };
  });
}

export interface TaxRuleOption {
  code: string;
  label: string;
  ratePct: number;
}

export function mapTaxRules(raw: unknown): TaxRuleOption[] {
  return asArray(raw)
    .map((item) => {
      const o = asRecord(item);
      return {
        code: String(o.code ?? ""),
        label: String(o.label ?? o.code ?? ""),
        ratePct: Number(o.ratePct ?? 0) || 0,
      };
    })
    .filter((r) => r.code);
}

export interface InvoicePreviewView {
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
  taxRatePct: number;
  currency: string;
  netDisplay: string;
  taxDisplay: string;
  grossDisplay: string;
  previewLine: string;
}

export function mapInvoicePreview(raw: unknown): InvoicePreviewView {
  const o = asRecord(raw);
  return {
    netAmount: Number(o.netAmount ?? 0) || 0,
    taxAmount: Number(o.taxAmount ?? 0) || 0,
    grossAmount: Number(o.grossAmount ?? 0) || 0,
    taxRatePct: Number(o.taxRatePct ?? 0) || 0,
    currency: String(o.currency ?? "GBP"),
    netDisplay: String(o.netDisplay ?? ""),
    taxDisplay: String(o.taxDisplay ?? ""),
    grossDisplay: String(o.grossDisplay ?? ""),
    previewLine: String(o.previewLine ?? ""),
  };
}

export interface CurrencyIntelligenceView {
  reportingCurrency: string;
  fxExposure: number;
  fxExposureDisplay: string;
  fxPnlImpactYtd: number;
  fxPnlImpactYtdDisplay: string;
  rates: FxRate[];
  projects: ProjectFxImpact[];
}

export function mapCurrencyIntelligence(raw: unknown): CurrencyIntelligenceView {
  const o = asRecord(raw);
  const rates: FxRate[] = asArray(o.rates).map((item) => {
    const r = asRecord(item);
    const change = Number(r.changePct ?? r.change24h ?? 0) || 0;
    return {
      pair: String(r.pair ?? `${r.baseCurrency ?? ""}/${r.quoteCurrency ?? ""}`),
      rate: Number(r.rate ?? 0) || 0,
      change24h: change,
      trend: change > 0.001 ? "up" : change < -0.001 ? "down" : "flat",
    };
  });

  const projects: ProjectFxImpact[] = asArray(o.projects).map((item) => {
    const p = asRecord(item);
    const fxPct = Number(p.fxImpactPct ?? 0) || 0;
    const revenue = Number(p.reportingRevenue ?? 0) || 0;
    return {
      project: String(p.project ?? ""),
      entity: String(p.entityCode ?? p.entity ?? "—"),
      currency: String(p.currency ?? "GBP"),
      exposureGbp: revenue,
      fxImpactGbp: revenue * (fxPct / 100),
      marginImpactPct: fxPct,
    };
  });

  return {
    reportingCurrency: String(o.reportingCurrency ?? "GBP"),
    fxExposure: Number(o.fxExposure ?? 0) || 0,
    fxExposureDisplay: String(o.fxExposureDisplay ?? "£0"),
    fxPnlImpactYtd: Number(o.fxPnlImpactYtd ?? 0) || 0,
    fxPnlImpactYtdDisplay: String(o.fxPnlImpactYtdDisplay ?? "£0"),
    rates,
    projects,
  };
}

export function currentPayrollPeriod(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
