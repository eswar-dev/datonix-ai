import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Send, ThumbsUp, ThumbsDown, Pin, Trash2, Search, Info, MessageSquareText, TableIcon, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { roleData, type BotResponse } from "@/data/machineData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "chart" | "table";
  response?: BotResponse;
}

const promptTypeIcon = {
  text: MessageSquareText,
  table: TableIcon,
  chart: BarChart3,
};

export default function BotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showChartInfo, setShowChartInfo] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const botConfig = user ? roleData[user.role].botConfig : null;

  useEffect(() => {
    if (botConfig) {
      setMessages([{
        id: "1",
        role: "assistant",
        content: botConfig.greeting,
        type: "text",
      }]);
    }
  }, [user?.role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const getMockResponse = (query: string): BotResponse => {
    if (!botConfig) return { type: "text", content: "" };
    const lowerQuery = query.toLowerCase();
    for (const [keyword, response] of Object.entries(botConfig.mockResponses)) {
      if (keyword !== "default" && lowerQuery.includes(keyword)) {
        return response;
      }
    }
    return botConfig.mockResponses.default || { type: "text", content: `Based on your query "${query}", here's what I found. The dataset shows significant patterns that warrant further investigation.` };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    const queryText = input;
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const response = getMockResponse(queryText);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        type: response.type,
        response,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: processed.slice(2) }} />;
      }
      if (/^\d+\.\s/.test(line)) {
        return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: processed.replace(/^\d+\.\s/, '') }} />;
      }
      if (line.trim() === "") return <br key={i} />;
      return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
    });
  };

  const renderAssistantMessage = (msg: Message) => {
    const resp = msg.response;

    return (
      <div className="max-w-[85%] space-y-3">
        {/* Text content */}
        <div className="rounded-card bg-card border px-4 py-3 text-sm">
          <div className="space-y-1 leading-relaxed">{renderMarkdown(msg.content)}</div>
        </div>

        {/* Table rendering */}
        {resp?.type === "table" && resp.tableHeaders && resp.tableRows && (
          <Card className="rounded-card border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {resp.tableHeaders.map((h) => (
                      <TableHead key={h} className="text-xs font-semibold">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resp.tableRows.map((row, ri) => (
                    <TableRow key={ri}>
                      {row.map((cell, ci) => (
                        <TableCell key={ci} className="text-xs">{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Chart rendering */}
        {resp?.type === "chart" && resp.chartData && (
          <Card className="rounded-card border p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">{resp.chartTitle}</h4>
              {resp.chartInfo && (
                <TooltipProvider>
                  <Tooltip open={showChartInfo === msg.id} onOpenChange={(open) => setShowChartInfo(open ? msg.id : null)}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[300px]">
                      <p className="text-xs leading-relaxed">{resp.chartInfo}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resp.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Feedback buttons */}
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Helpful">
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Not helpful">
            <ThumbsDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  if (!user || !botConfig) return null;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left panel */}
      <div className="flex w-[300px] shrink-0 flex-col gap-4">
        <Select>
          <SelectTrigger className="rounded-input">
            <SelectValue placeholder="Select dataset" />
          </SelectTrigger>
          <SelectContent>
            {botConfig.datasets.map((ds) => (
              <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Suggested Prompts</p>
          <div className="flex flex-col gap-1.5">
            {botConfig.suggestedPrompts.map((p) => {
              const Icon = promptTypeIcon[p.type];
              return (
                <button
                  key={p.text}
                  onClick={() => setInput(p.text)}
                  className="flex items-center gap-2 rounded-button border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="truncate">{p.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">Chat History</p>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-7 pl-7 text-xs rounded-input" />
          </div>
          <div className="space-y-1">
            {botConfig.chatHistory.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-button px-2 py-1.5 text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="truncate">{h.title}</span>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Pin">
                    <Pin className={`h-3 w-3 ${h.pinned ? "text-accent" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" aria-label="Delete">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat viewport */}
      <Card className="flex flex-1 flex-col rounded-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[80%] rounded-card px-4 py-3 text-sm bg-accent text-accent-foreground">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : msg.response ? (
                renderAssistantMessage(msg)
              ) : (
                <div className="max-w-[80%] rounded-card px-4 py-3 text-sm bg-card border">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-card border bg-card px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data… (Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-input border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button onClick={handleSend} size="icon" className="rounded-button shrink-0" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
