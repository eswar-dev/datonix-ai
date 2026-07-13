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
import { taxRules } from "@/domains/aec/data/accounting";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

export interface InvoiceFormData {
  entity: string;
  client: string;
  project: string;
  type: string;
  currency: string;
  netAmount: number;
}

interface InvoiceFormProps {
  data: InvoiceFormData;
  onChange: (data: InvoiceFormData) => void;
}

const invoiceTypes = ["Milestone", "Progress", "Final", "Retainer"];

export function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  const { activeTwin, projects } = useAecApp();
  const clients = useMemo(() => [...new Set(projects.map((p) => p.client))], [projects]);
  const projectNames = useMemo(() => projects.map((p) => p.name), [projects]);

  const taxRule = taxRules[data.entity] ?? "UK VAT 20%";
  const vatRate = data.entity === "MC" ? 0.05 : 0.2;
  const vatAmount = Math.round(data.netAmount * vatRate);
  const grossAmount = data.netAmount + vatAmount;

  const handleEntityChange = (entity: string) => {
    const currency = entity === "MC" ? "AED" : "GBP";
    onChange({ ...data, entity, currency });
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
            <Select value={data.entity} onValueChange={handleEntityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                {activeTwin.entities.map((e) => (
                  <SelectItem key={e.code} value={e.code}>
                    {e.code} — {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={data.client} onValueChange={(v) => onChange({ ...data, client: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={data.project} onValueChange={(v) => onChange({ ...data, project: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projectNames.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
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
                    <SelectItem key={t} value={t}>{t}</SelectItem>
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
              <span className="text-muted-foreground">Tax Rule (auto)</span>
              <span className="font-medium">{taxRule}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Amount</span>
              <span>{data.currency} {data.netAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT</span>
              <span>{data.currency} {vatAmount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Gross Total</span>
              <span>{data.currency} {grossAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
