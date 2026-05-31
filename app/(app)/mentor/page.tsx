"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Send, Bot, Sparkles, Loader2, User, Trash2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "Explain a tricky topic",
    description: "Get a simple, step-by-step explanation",
    prompt: "Can you explain photosynthesis to me in a simple way I'll remember?",
  },
  {
    title: "Help with homework",
    description: "Walk through a problem step-by-step",
    prompt: "I'm stuck on this math problem — can you help me figure it out without just giving me the answer?",
  },
  {
    title: "Tell me about my dream career",
    description: "What does this job actually look like?",
    prompt: "What does a typical day look like for my dream career? What subjects help most?",
  },
  {
    title: "Quiz me",
    description: "Practice with a quick mini-quiz",
    prompt: "Quiz me with 3 fun questions on any subject I'm learning. Make them age-appropriate.",
  },
];

export default function Mentor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [tier, setTier] = useState<string>("free");
  const supabase = createClient();
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();

  // Honour `?seed=` — the ForgeBot floating companion deep-links here
  // with a starter prompt. Prefill the input and focus so the kid just
  // taps Send. Only fires once per mount.
  useEffect(() => {
    const seed = searchParams?.get("seed");
    if (seed && seed.length > 0 && seed.length < 500) {
      setInput(seed);
      // Defer focus until the textarea exists.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
    // We intentionally only seed once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setInitialLoading(false);
          return;
        }

        const [profileRes, response] = await Promise.all([
          supabase
            .from("profiles")
            .select("subscription_tier")
            .eq("id", session.user.id)
            .maybeSingle(),
          fetch("/api/ai-mentor", { method: "GET" }),
        ]);
        if (profileRes.data?.subscription_tier) setTier(profileRes.data.subscription_tier);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [supabase]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setInput("");
    setLoading(true);

    // Optimistic user message
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai-mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        toast.error(
          data.message ||
            "Daily ForgeBot limit reached. Upgrade to Pro for unlimited coaching.",
          { duration: 6000 }
        );
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        setInput(text);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error("Failed to get mentor response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== userMsg.id),
        userMsg,
        {
          id: `${Date.now()}-ai`,
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error: any) {
      console.error(error);
      toast.error("ForgeBot is offline right now. Try again in a moment.");
      // Remove the optimistic user message
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearConversation = async () => {
    if (
      !window.confirm(
        "Clear your entire ForgeBot conversation? This can't be undone."
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const res = await fetch("/api/ai-mentor", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      setMessages([]);
      toast.success("Conversation cleared");
    } catch {
      toast.error("Couldn't clear the conversation. Try again.");
    } finally {
      setClearing(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  const isEmpty = messages.length === 0;

  // Daily message counter (free tier only — Pro/Family are unlimited).
  const isPaid = tier === "pro" || tier === "family";
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = messages.filter(
    (m) => m.role === "user" && new Date(m.created_at) >= startOfDay
  ).length;
  const dailyLimit = 10;
  const remaining = Math.max(0, dailyLimit - usedToday);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-white/[0.06]">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot size={18} className="text-white" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0f]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-base">ForgeBot</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Your mentor
              </span>
              {!isPaid && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                    remaining === 0
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      : remaining <= 3
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                  }`}
                  title={
                    remaining === 0
                      ? "Daily limit hit. Upgrade to Pro for unlimited."
                      : `${remaining} of ${dailyLimit} free messages left today`
                  }
                >
                  {remaining}/{dailyLimit} today
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs text-slate-400">Online · Knows your goals & progress</p>
            </div>
          </div>
          {!isEmpty && (
            <button
              onClick={clearConversation}
              disabled={clearing}
              aria-label="Clear conversation"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] disabled:opacity-50 transition-colors"
            >
              {clearing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="relative w-16 h-16 mb-5">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 opacity-20 blur-xl" />
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                  <Bot size={28} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold tracking-tight mb-2">
                Hey, I'm ForgeBot.
              </h2>
              <p className="text-sm text-slate-400 max-w-md mb-8">
                I know your career path, level, and goals. Ask me anything —
                career advice, project ideas, what to learn next, or just talk it out.
              </p>

              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p.title}
                    onClick={() => sendMessage(p.prompt)}
                    disabled={loading}
                    className="text-left p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all disabled:opacity-50"
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles size={13} className="text-violet-300 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium mb-0.5">{p.title}</div>
                        <div className="text-xs text-slate-400">{p.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-white text-slate-900 rounded-br-sm"
                        : "bg-white/[0.04] border border-white/[0.06] text-slate-100 rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <User size={14} className="text-slate-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -4, 0],
                            opacity: [0.4, 1, 0.4],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-violet-300"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pt-4 border-t border-white/[0.06]">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ForgeBot anything..."
              rows={1}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none disabled:opacity-50"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center hover:from-violet-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30"
            >
              {loading ? (
                <Loader2 size={14} className="text-white animate-spin" />
              ) : (
                <Send size={14} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 px-1">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
