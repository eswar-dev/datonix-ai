import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { InvoicePreviewView, TaxRuleOption } from "@/domains/aec/api/accountingMappers";

export interface InvoiceFormData {
  entityId: string;
  entityCode: string;
  client: string;
  projectId: string;
  type: string;
  currency: string;
  netAmount: number;
  taxRule: string;
  dueDate: string;
}

interface InvoiceFormProps {
  data: InvoiceFormData;
  onChange: (data: InvoiceFormData) => void;
  taxRules: TaxRuleOption[];
  preview: InvoicePreviewView | null;
}

const invoiceTypes = ["Milestone", "Progress", "Final", "Retainer"];

export function InvoiceForm({ data, onChange, taxRules, preview }: InvoiceFormProps) {
  const { activeTwin, projects } = useAecApp();

  const clients = useMemo(() => [...new Set(projects.map((p) => p.client).filter(Boolean))], [projects]);
  const entityProjects = useMemo(() => {
    if (!data.entityId) return projects;
    return projects.filter((p) => p.entityId === data.entityId || p.entity === data.entityCode);
  }, [projects, data.entityId, data.entityCode]);

  const selectedRule = taxRules.find((r) => r.code === data.taxRule);
  const vatRate = (selectedRule?.ratePct ?? 20) / 100;
  const vatAmount = preview?.taxAmount ?? Math.round(data.netAmount * vatRate * 100) / 100;
  const grossAmount = preview?.grossAmount ?? data.netAmount + vatAmount;

  const handleEntityChange = (entityId: string) => {
    const entity = activeTwin.entities.find((e) => e.id === entityId);
    const code = entity?.code ?? "";
    const currency = /mc|uae|aed/i.test(code + (entity?.name ?? "")) ? "AED" : "GBP";
    const taxRule =
      currency === "AED"
        ? taxRules.find((r) => /uae/i.test(r.code))?.code ?? data.taxRule
        : taxRules.find((r) => /uk_vat_20/i.test(r.code))?.code ?? data.taxRule;
    onChange({
      ...data,
      entityId,
      entityCode: code,
      currency,
      taxRule: taxRule || data.taxRule,
      projectId: "",
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={data.entityId || undefined} onValueChange={handleEntityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {activeTwin.entities.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.code} — {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            {clients.length > 0 ? (
              <Select value={data.client || undefined} onValueChange={(v) => onChange({ ...data, client: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={data.client}
                onChange={(e) => onChange({ ...data, client: e.target.value })}
                placeholder="Client name"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={data.projectId || undefined}
              onValueChange={(v) => {
                const p = entityProjects.find((x) => x.id === v);
                onChange({
                  ...data,
                  projectId: v,
                  client: data.client || p?.client || "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {entityProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Type</Label>
              <Select value={data.type} onValueChange={(v) => onChange({ ...data, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {invoiceTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={data.currency} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tax rule</Label>
            <Select value={data.taxRule || undefined} onValueChange={(v) => onChange({ ...data, taxRule: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select tax rule" />
              </SelectTrigger>
              <SelectContent>
                {taxRules.map((r) => (
                  <SelectItem key={r.code} value={r.code}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due date</Label>
            <Input
              type="date"
              value={data.dueDate}
              onChange={(e) => onChange({ ...data, dueDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Net Amount</Label>
            <Input
              type="number"
              value={data.netAmount || ""}
              onChange={(e) => onChange({ ...data, netAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Tax & Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax Rule</span>
              <span className="font-medium">{selectedRule?.label ?? data.taxRule}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Amount</span>
              <span>
                {preview?.netDisplay || `${data.currency} ${data.netAmount.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT</span>
              <span>
                {preview?.taxDisplay || `${data.currency} ${vatAmount.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Gross Total</span>
              <span>
                {preview?.grossDisplay || `${data.currency} ${grossAmount.toLocaleString()}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
