import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Share2, Maximize2, ZoomIn, ZoomOut, Plus, Search, Bell, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

export default function Reports() {
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState("1");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [search, setSearch] = useState("");

  if (!user) return null;
  const data = roleData[user.role].reports;
  const datasets = roleData[user.role].dataSources.datasets;

  const roleReports = data.available.map((r, i) => ({
    id: String(i + 1),
    name: r.name,
    type: r.category,
    date: r.lastRun,
    status: r.status,
    author: user.name,
  }));

  const selectedReport = roleReports.find((r) => r.id === selectedReportId) || roleReports[0];
  const reportContent = data.reportContent[selectedReport.name];

  const filtered = roleReports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        {/* Left sidebar */}
        <div className="flex w-[260px] shrink-0 flex-col gap-3">
          <Button onClick={() => { setWizardOpen(true); setWizardStep(1); }} className="w-full rounded-button">
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="pl-8 rounded-input"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`w-full rounded-button border px-3 py-2 text-left text-xs transition-colors ${
                  selectedReport.id === r.id ? "border-accent bg-accent/5" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <p className="font-medium truncate flex-1">{r.name}</p>
                  {r.status === "Alert" && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5">
                      <Bell className="h-2.5 w-2.5" />
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-muted-foreground">
                  {r.type} · {r.date}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main viewer */}
        <Card className="flex flex-1 flex-col rounded-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {reportContent ? `${reportContent.sections.length} sections` : "Page 1 / 4"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Fullscreen">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-button">
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
              <Button size="sm" className="h-8 gap-1.5 rounded-button">
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Report canvas */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 p-8 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-card border bg-card p-12 shadow-sm">
              <h2 className="text-xl font-semibold">{selectedReport.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generated on {selectedReport.date} by {selectedReport.author}
              </p>

              {reportContent ? (
                <div className="mt-6 space-y-6">
                  {/* Summary */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Executive Summary</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reportContent.summary}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                    {reportContent.keyMetrics.map((m) => (
                      <div key={m.label} className="rounded-lg border p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</p>
                        <p className="text-lg font-bold mt-1">{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sections */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Report Sections</h3>
                    <div className="space-y-2">
                      {reportContent.sections.map((section, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">{i + 1}</span>
                          <span className="text-sm">{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart placeholder */}
                  <div className="h-48 rounded-lg bg-muted/50 border-2 border-dashed border-muted flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">📊 Interactive chart visualization</p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <div className="h-4 skeleton-shimmer rounded w-full" />
                  <div className="h-4 skeleton-shimmer rounded w-5/6" />
                  <div className="h-4 skeleton-shimmer rounded w-4/6" />
                  <div className="mt-6 h-48 skeleton-shimmer rounded" />
                  <div className="h-4 skeleton-shimmer rounded w-full" />
                  <div className="h-4 skeleton-shimmer rounded w-3/4" />
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t px-4 py-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Category: {selectedReport.type}</span>
              <span>·</span>
              <span>Author: {selectedReport.author}</span>
              <span>·</span>
              <Badge variant={selectedReport.status === "Alert" ? "destructive" : "secondary"} className="text-[10px]">
                {selectedReport.status === "Alert" ? "⚠️ Alert" : "Ready"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent AI Insights — role-dynamic */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-warning" />
          Recent AI Insights
        </h2>
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
          {data.recentInsights.map((insight, i) => (
            <Card key={i} className="rounded-card p-4 flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-muted-foreground">{insight}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Generate Report Wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Report — Step {wizardStep} of 3</DialogTitle>
          </DialogHeader>

          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select a dataset to base your report on.</p>
              <Select>
                <SelectTrigger className="rounded-input">
                  <SelectValue placeholder="Choose dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Choose a report template.</p>
              <div className="grid grid-cols-2 gap-3">
                {["Financial Summary", "Data Quality", "Trend Analysis", "Executive Brief"].map((t) => (
                  <Card key={t} className="cursor-pointer rounded-card p-4 text-center hover:border-accent transition-colors">
                    <FileText className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-xs font-medium">{t}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Configure report parameters.</p>
              <div className="space-y-3">
                <Input placeholder="Report title" className="rounded-input" />
                <Select>
                  <SelectTrigger className="rounded-input">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {wizardStep > 1 && (
              <Button variant="outline" className="rounded-button" onClick={() => setWizardStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {wizardStep < 3 ? (
              <Button className="rounded-button" onClick={() => setWizardStep((s) => s + 1)}>
                Next
              </Button>
            ) : (
              <Button className="rounded-button" onClick={() => setWizardOpen(false)}>
                Generate
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
