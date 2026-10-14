"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2, AlertCircle, Clock, Lock } from "lucide-react";
import { useChatReflect } from "@/lib/hooks/mutations/useReflectMutations";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { formatMonthYear } from "@/lib/utils";
import type { ReflectReport, ChatReflectMessage, ReflectLimits } from "@/types/api";

interface ReflectChatDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReflectReport;
  limits?: ReflectLimits;
}

const STARTER_PROMPTS = [
  "Why did I get this Spender Personality?",
  "What was my biggest expense category?",
  "How can I improve my savings next month?",
  "Did I have any irregular spending clusters?",
];

export function ReflectChatDrawer({
  isOpen,
  onOpenChange,
  report,
  limits,
}: ReflectChatDrawerProps) {
  const queryClient = useQueryClient();
  const dbHistory = report.data?.chatHistory;
  const monthName = formatMonthYear(report.year, report.month);

  const { data: isChattingElsewhere } = useQuery({
    queryKey: QUERY_KEYS.reflect.chatting,
    queryFn: () => false,
    initialData: false,
  });

  const canChat = limits
    ? limits.chat.canChat && limits.chat.dailyRemaining > 0
    : true;

  const [localMessages, setLocalMessages] = useState<ChatReflectMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When dbHistory updates (e.g. from server sync), clear local optimistic state
  useEffect(() => {
    setLocalMessages([]);
  }, [dbHistory]);

  const messages = useMemo<ChatReflectMessage[]>(() => {
    if (localMessages.length > 0) return localMessages;
    if (dbHistory && dbHistory.length > 0) return dbHistory;
    return [
      {
        role: "model",
        content: `Hi there! I'm your FinFlow Reflect Companion. I've analyzed your ${monthName} finances and have all your spending metrics right here. What would you like to explore or discuss?`,
      },
    ];
  }, [localMessages, dbHistory, monthName]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatReflect();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = (msgToSend?: string) => {
    const text = (msgToSend || inputMessage).trim();
    if (!text || !canChat || chatMutation.isPending || isChattingElsewhere) return;

    setErrorMsg(null);
    setInputMessage("");

    // Optimistically add user message
    const updatedHistory: ChatReflectMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setLocalMessages(updatedHistory);

    chatMutation.mutate(
      {
        reportId: report.id,
        message: text,
        history: updatedHistory.slice(-8), // Keep last 8 turns for context window
      },
      {
        onSuccess: (data) => {
          if (data?.reply) {
            const nextHistory: ChatReflectMessage[] = [
              ...updatedHistory,
              { role: "model", content: data.reply },
            ];
            setLocalMessages(nextHistory);
            // Invalidate report query so cache has the latest persisted chat
            queryClient.invalidateQueries({
              queryKey: QUERY_KEYS.reflect.byMonth(report.year, report.month),
            });
          }
        },
        onError: (err) => {
          setErrorMsg(err.message || "Failed to get AI response. Please try again.");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl h-[85vh] max-h-[700px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Reflect AI Chat</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {report.data?.personality_reveal?.archetype_title}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Clock className="size-3" />
                <span>Grounded in {monthName} snapshot • History saved automatically</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                </div>

                <div
                  className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-[2px]"
                      : "bg-muted/70 border border-border text-foreground rounded-tl-[2px]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          })}

          {chatMutation.isPending && (
            <div className="flex items-start gap-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground border border-border">
                <Bot className="size-3.5" />
              </div>
              <div className="rounded-lg rounded-tl-[2px] bg-muted/70 border border-border px-3.5 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}

          {isChattingElsewhere && !chatMutation.isPending && (
            <div className="flex items-start gap-3">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground border border-border">
                <Bot className="size-3.5" />
              </div>
              <div className="rounded-lg rounded-tl-[2px] bg-muted/70 border border-border px-3.5 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" />
                <span>AI is replying on another device...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Proactive Limit Warning Banner */}
        {!canChat && (
          <div className="px-4 py-2.5 bg-muted border-t border-border flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Lock className="size-3.5 text-amber-500 shrink-0" />
            <span>Daily limit of 30 messages reached for today. Resets in 24 hours.</span>
          </div>
        )}

        {/* Starter Chips (shown when fewer than 3 messages and chat is allowed) */}
        {canChat && messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-border/50 bg-background flex flex-wrap gap-1.5 shrink-0">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={chatMutation.isPending || !canChat || isChattingElsewhere}
                className="text-[11px] px-2.5 py-1 rounded-md border border-border bg-card hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Footer Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2 shrink-0"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isChattingElsewhere
                ? "AI is replying on another device, please wait..."
                : canChat
                ? "Ask anything about your spending or habits..."
                : "Daily chat limit reached"
            }
            disabled={!canChat || chatMutation.isPending || isChattingElsewhere}
            className="h-10 text-xs sm:text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              !inputMessage.trim() ||
              !canChat ||
              chatMutation.isPending ||
              isChattingElsewhere
            }
            className="h-10 w-10 shrink-0"
          >
            {chatMutation.isPending || isChattingElsewhere ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
