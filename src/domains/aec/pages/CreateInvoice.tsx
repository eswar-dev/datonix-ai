import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { InvoiceForm, type InvoiceFormData } from "@/domains/aec/components/InvoiceForm";
import {
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { InvoicePreviewView } from "@/domains/aec/api/accountingMappers";
import { toast } from "sonner";

function defaultDueDate(): string {
  return new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
}

export default function CreateInvoice() {
  const navigate = useNavigate();
  const {
    activeTwin,
    createInvoice,
    loadTaxRules,
    previewInvoice,
    refreshPipeline,
    taxRules,
  } = useAecApp();

  const firstEntity = activeTwin.entities[0];
  const [form, setForm] = useState<InvoiceFormData>({
    entityId: firstEntity?.id ?? "",
    entityCode: firstEntity?.code ?? "",
    client: "",
    projectId: "",
    type: "Milestone",
    currency: "GBP",
    netAmount: 0,
    taxRule: "UK_VAT_20",
    dueDate: defaultDueDate(),
  });
  const [preview, setPreview] = useState<InvoicePreviewView | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshPipeline();
    setLoading(true);
    void loadTaxRules().finally(() => setLoading(false));
  }, [refreshPipeline, loadTaxRules]);

  useEffect(() => {
    if (!form.entityId && activeTwin.entities[0]) {
      const e = activeTwin.entities[0];
      setForm((f) => ({ ...f, entityId: e.id, entityCode: e.code }));
    }
  }, [activeTwin.entities, form.entityId]);

  useEffect(() => {
    if (taxRules.length && !taxRules.some((r) => r.code === form.taxRule)) {
      setForm((f) => ({ ...f, taxRule: taxRules[0].code }));
    }
  }, [taxRules, form.taxRule]);

  useEffect(() => {
    if (!form.netAmount || form.netAmount <= 0 || !form.taxRule) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      void previewInvoice({
        netAmount: form.netAmount,
        taxRule: form.taxRule,
        currency: form.currency,
        client: form.client,
        invoiceType: form.type.toLowerCase(),
      }).then((p) => {
        if (!cancelled) setPreview(p);
      });
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [form.netAmount, form.taxRule, form.currency, form.client, form.type, previewInvoice]);

  const handleCreate = async () => {
    if (!form.entityId) {
      toast.error("Select an entity");
      return;
    }
    if (!form.client.trim() || form.netAmount <= 0) {
      toast.error("Enter client and a valid net amount");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createInvoice({
        entityId: form.entityId,
        client: form.client.trim(),
        projectId: form.projectId || undefined,
        invoiceType: form.type,
        currency: form.currency,
        netAmount: form.netAmount,
        taxRule: form.taxRule,
        dueDate: form.dueDate || undefined,
      });
      toast.success(`Invoice ${created.number || created.id} created`);
      navigate("/accounting");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Create failed";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Create Invoice"
        subtitle="Draft a new invoice with tax rules and net + VAT preview."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Create Invoice" },
        ]}
      />

      {loading && <PipelineLoadingBanner label="Loading tax rules…" />}
      <PipelineErrorBanner message={error ?? ""} />

      <InvoiceForm data={form} onChange={setForm} taxRules={taxRules} preview={preview} />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/accounting")}>
          Cancel
        </Button>
        <Button onClick={() => void handleCreate()} disabled={submitting}>
          <FileText className="mr-2 h-4 w-4" />
          {submitting ? "Creating…" : "Create Invoice"}
        </Button>
      </div>
    </div>
  );
}
