import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, ThumbsUp, ThumbsDown, Pin, Trash2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "chart" | "table";
}

export default function BotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const botConfig = user ? roleData[user.role].botConfig : null;

  // Initialize greeting when user/role changes
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

  const getMockResponse = (query: string): string => {
    if (!botConfig) return "";
    const lowerQuery = query.toLowerCase();
    for (const [keyword, response] of Object.entries(botConfig.mockResponses)) {
      if (keyword !== "default" && lowerQuery.includes(keyword)) {
        return response;
      }
    }
    return botConfig.mockResponses.default || `Based on your query "${query}", here's what I found:\n\nThe dataset shows significant patterns that warrant further investigation. I've identified 3 key anomalies in the selected period.`;
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
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getMockResponse(queryText),
        type: "text",
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
          <div className="flex flex-wrap gap-1.5">
            {botConfig.suggestedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="rounded-button border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {p}
              </button>
            ))}
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
              <div
                className={`max-w-[80%] rounded-card px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && (
                  <div className="mt-2 flex gap-1 border-t pt-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Helpful">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Not helpful">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
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
