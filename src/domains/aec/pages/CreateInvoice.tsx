import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { InvoiceForm, type InvoiceFormData } from "@/domains/aec/components/InvoiceForm";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const { createInvoice } = useAecApp();
  const [form, setForm] = useState<InvoiceFormData>({
    entity: "MA",
    client: "Holborn Partners",
    project: "Kings Cross Tower",
    type: "Milestone",
    currency: "GBP",
    netAmount: 48_000,
  });

  const handleCreate = () => {
    if (!form.client || !form.project || form.netAmount <= 0) {
      toast.error("Please complete all required fields");
      return;
    }
    createInvoice({
      entity: form.entity,
      client: form.client,
      project: form.project,
      amountGbp: form.netAmount,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    });
    toast.success(`Invoice created for ${form.client} — ${form.currency} ${form.netAmount.toLocaleString()} net`);
    navigate("/accounting");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Create Invoice"
        subtitle="Draft a new invoice with auto tax rules and net + VAT preview."
        breadcrumb={[
          { label: "Accounting", href: "/accounting" },
          { label: "Create Invoice" },
        ]}
      />

      <InvoiceForm data={form} onChange={setForm} />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate("/accounting")}>
          Cancel
        </Button>
        <Button onClick={handleCreate}>
          <FileText className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
