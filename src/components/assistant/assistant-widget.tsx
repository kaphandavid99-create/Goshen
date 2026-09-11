"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Loader2, Mic, SendHorizonal, Square, Volume2, VolumeX, X } from "lucide-react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { MessageContent } from "@/components/assistant/message-content";

type MicState = "idle" | "recording" | "transcribing";

/** Pick a MIME type the browser's recorder actually supports; undefined lets it choose. */
function pickRecorderMimeType() {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return undefined;
  }
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

/** Plain-text version of a reply for speech — drop markdown syntax and bare links. */
function stripForSpeech(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>]+/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best-effort voice selection for the assistant's spoken replies: prefer a
 * voice for an African region of the current language, then lean toward a
 * male-sounding one by name. The browser only ever offers voices already
 * installed on the visitor's device, so there is no guarantee a matching
 * voice exists — this just picks the closest thing available and nudges the
 * pitch down a touch so the fallback still reads as a deeper, male-leaning
 * voice.
 */
const AFRICAN_VOICE_LANGS: Record<"en" | "fr", string[]> = {
  en: ["en-ng", "en-gh", "en-za", "en-ke", "en-tz"],
  fr: ["fr-cm", "fr-ci", "fr-sn", "fr-cd", "fr-ml", "fr-ne"],
};

const MALE_NAME_HINTS = [
  "male",
  " man",
  "guy",
  "daniel",
  "david",
  "george",
  "thomas",
  "arthur",
  "fred",
  "james",
  "mark",
  "matthew",
  "brian",
  "eric",
  "kevin",
  "paul",
  "luke",
  "abeo",
  "chilemba",
  "obinna",
  "kwame",
  "kofi",
  "sipho",
  "themba",
  "musa",
];

const FEMALE_NAME_HINTS = [
  "female",
  " woman",
  "zira",
  "hazel",
  "samantha",
  "victoria",
  "susan",
  "karen",
  "moira",
  "tessa",
  "fiona",
  "amelie",
  "audrey",
  "celine",
  "julie",
  "aurelie",
  "ezinne",
  "leah",
  "asilia",
  "amina",
  "nneka",
  "adaeze",
];

function scoreVoice(voice: SpeechSynthesisVoice, preferredLangs: string[]) {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  let score = 0;

  const langIndex = preferredLangs.indexOf(lang);
  if (langIndex >= 0) score += 100 - langIndex;

  if (MALE_NAME_HINTS.some((hint) => name.includes(hint))) score += 20;
  if (FEMALE_NAME_HINTS.some((hint) => name.includes(hint))) score -= 20;

  return score;
}

function pickVoice(voices: SpeechSynthesisVoice[], locale: "en" | "fr") {
  if (!voices.length) return undefined;

  const baseMatches = voices.filter((v) => v.lang.toLowerCase().startsWith(locale));
  const pool = baseMatches.length ? baseMatches : voices;
  const preferredLangs = AFRICAN_VOICE_LANGS[locale];

  return pool.reduce<SpeechSynthesisVoice | undefined>((best, voice) => {
    if (!best) return voice;
    return scoreVoice(voice, preferredLangs) > scoreVoice(best, preferredLangs) ? voice : best;
  }, undefined);
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const THREAD_KEY = "goshen_chat_thread";
const VOICE_KEY = "goshen_chat_voice";

function uid() {
  return Math.random().toString(36).slice(2);
}

export function AssistantWidget() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { t, locale } = useI18n();
  const a = t.assistant;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolLabel, setToolLabel] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [micSupported, setMicSupported] = useState(false);
  const [micState, setMicState] = useState<MicState>("idle");
  const [micError, setMicError] = useState<string | null>(null);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function detectSupport() {
      const mic =
        typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof window.MediaRecorder !== "undefined";
      const voice = typeof window !== "undefined" && "speechSynthesis" in window;
      if (cancelled) return;
      setMicSupported(mic);
      setVoiceSupported(voice);
      if (voice) {
        setVoices(window.speechSynthesis.getVoices());
        try {
          setVoiceEnabled(window.localStorage.getItem(VOICE_KEY) === "1");
        } catch {
          /* private mode */
        }
      }
    }

    void detectSupport();

    function handleVoicesChanged() {
      setVoices(window.speechSynthesis.getVoices());
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged);
    }

    return () => {
      cancelled = true;
      mediaRecorderRef.current?.stop();
      micStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (!open || hydrated) return;
    let cancelled = false;

    async function rehydrate() {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(THREAD_KEY);
      } catch {
        /* private mode */
      }
      if (!cancelled && stored) setThreadId(stored);

      try {
        const url = stored
          ? `/api/assistant/thread?threadId=${encodeURIComponent(stored)}`
          : "/api/assistant/thread";
        const res = await fetch(url, { cache: "no-store" });
        const data = (await res.json()) as {
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        if (!cancelled && data.messages?.length) {
          setMessages(data.messages.map((m) => ({ ...m, id: uid() })));
        }
      } catch {
        /* offline — start fresh */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    void rehydrate();
    return () => {
      cancelled = true;
    };
  }, [open, hydrated]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      inputRef.current?.focus();
    }
  }, [open, messages, toolLabel]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      const plain = stripForSpeech(text);
      if (!plain) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(plain);
      utterance.lang = locale === "fr" ? "fr-FR" : "en-US";
      // Lean the voice male: pick the closest African-region match by name,
      // and nudge the pitch down so even a fallback voice reads deeper.
      const voice = pickVoice(voices, locale);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.pitch = 0.82;
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled, locale, voices],
  );

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) stopSpeaking();
      try {
        window.localStorage.setItem(VOICE_KEY, next ? "1" : "0");
      } catch {
        /* private mode */
      }
      return next;
    });
  }, [stopSpeaking]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
      const assistantMsg: ChatMessage = { id: uid(), role: "assistant", content: "" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setBusy(true);
      setToolLabel(null);

      let failed = false;
      const fail = (message: string) => {
        failed = true;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: message, error: true } : m,
          ),
        );
        speak(message);
      };

      try {
        const csrf = await readCsrf();
        const res = await fetch("/api/assistant", {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json", "x-csrf-token": csrf },
          body: JSON.stringify({ threadId: threadId ?? undefined, message: text }),
        });

        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          fail(data?.error ?? a.unavailable);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalText = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let event: Record<string, unknown>;
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }

            if (event.type === "text") {
              const delta = String(event.delta ?? "");
              finalText += delta;
              setToolLabel(null);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m,
                ),
              );
            } else if (event.type === "tool") {
              setToolLabel(
                a.toolLabels[String(event.name)] ?? a.toolLabels.working,
              );
            } else if (event.type === "done") {
              if (typeof event.threadId === "string") {
                setThreadId(event.threadId);
                try {
                  window.localStorage.setItem(THREAD_KEY, event.threadId);
                } catch {
                  /* ignore */
                }
              }
            } else if (event.type === "error") {
              fail(String(event.message ?? a.somethingWrong));
            }
          }
        }

        if (finalText) {
          speak(finalText);
        } else if (!failed) {
          speak(a.noAnswer);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id && !m.content && !m.error
              ? { ...m, content: a.noAnswer, error: true }
              : m,
          ),
        );
      } catch {
        fail(a.networkProblem);
      } finally {
        setBusy(false);
        setToolLabel(null);
      }
    },
    [busy, threadId, a, speak],
  );

  const transcribe = useCallback(
    async (blob: Blob) => {
      if (blob.size === 0) {
        setMicError(a.micError);
        setMicState("idle");
        return;
      }

      try {
        const csrf = await readCsrf();
        const extension = blob.type.includes("mp4")
          ? "mp4"
          : blob.type.includes("ogg")
            ? "ogg"
            : "webm";
        const form = new FormData();
        form.append("audio", blob, `voice-message.${extension}`);
        form.append("locale", locale);

        const res = await fetch("/api/assistant/transcribe", {
          method: "POST",
          credentials: "same-origin",
          headers: { "x-csrf-token": csrf },
          body: form,
        });
        const data = (await res.json().catch(() => null)) as
          | { text?: string; error?: string }
          | null;

        if (!res.ok || !data?.text) {
          setMicError(data?.error ?? a.micError);
          return;
        }

        setInput((prev) => (prev ? `${prev.trim()} ${data.text}` : (data.text as string)));
        inputRef.current?.focus();
      } catch {
        setMicError(a.micError);
      } finally {
        setMicState("idle");
      }
    },
    [a, locale],
  );

  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        micStreamRef.current?.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
        const blob = new Blob(audioChunksRef.current, {
          type: mimeType ?? recorder.mimeType ?? "audio/webm",
        });
        void transcribe(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setMicState("recording");
    } catch {
      setMicError(a.micPermissionDenied);
      setMicState("idle");
    }
  }, [a, transcribe]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setMicState("transcribing");
  }, []);

  const toggleMic = useCallback(() => {
    if (micState === "recording") {
      stopRecording();
    } else if (micState === "idle") {
      void startRecording();
    }
  }, [micState, startRecording, stopRecording]);

  const panelMotion = useMemo(
    () =>
      reduce
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            initial: { opacity: 0, y: 24, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 24, scale: 0.98 },
          },
    [reduce],
  );

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.button
        type="button"
        aria-label={open ? a.close : a.open}
        aria-expanded={open}
        onClick={() => {
          if (open) stopSpeaking();
          setOpen((v) => !v);
        }}
        initial={reduce ? false : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 460, damping: 26, delay: 0.35 }
        }
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className={cn(
          "assistant-fab fixed right-4 z-[55] grid size-14 place-items-center rounded-full text-primary-foreground",
          "bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-4",
          open && "sm:hidden",
        )}
      >
        {!open ? (
          <>
            <span aria-hidden className="assistant-fab-glow" />
            <span aria-hidden className="assistant-fab-status" />
          </>
        ) : null}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "mark"}
            className="grid place-items-center"
            initial={reduce ? false : { rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { rotate: 60, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.16 }}
          >
            {open ? (
              <X className="size-6" />
            ) : (
              <AssistantMark className="size-7" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            {...panelMotion}
            transition={reduce ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="card fixed inset-x-0 bottom-0 z-[60] flex h-[85vh] flex-col overflow-hidden rounded-b-none p-0 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:h-[560px] sm:w-[380px] sm:rounded-2xl"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <AssistantMark className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={a.closeShort}
                onClick={() => {
                  stopSpeaking();
                  setOpen(false);
                }}
                className="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{a.greeting}</p>
                  <div className="flex flex-wrap gap-2">
                    {a.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-primary transition hover:bg-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex justify-start">
                    <div
                      className={cn(
                        "max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2",
                        m.error && "text-destructive",
                      )}
                    >
                      {m.content ? (
                        <MessageContent text={m.content} onNavigate={() => setOpen(false)} />
                      ) : (
                        <TypingDots />
                      )}
                    </div>
                  </div>
                ),
              )}

              {toolLabel ? (
                <p className="pl-1 text-xs text-muted-foreground">{toolLabel}</p>
              ) : null}
            </div>

            {micState !== "idle" || micError ? (
              <div className="border-t border-border px-4 py-2 text-xs">
                {micState === "recording" ? (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <span className="size-2 animate-pulse rounded-full bg-destructive" />
                    {a.micRecording}
                  </span>
                ) : micState === "transcribing" ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    {a.micTranscribing}
                  </span>
                ) : micError ? (
                  <span className="text-destructive">{micError}</span>
                ) : null}
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2 border-t border-border px-3 py-3"
            >
              {micSupported || voiceSupported ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  {micSupported ? (
                    <button
                      type="button"
                      aria-label={micState === "recording" ? a.micStop : a.micLabel}
                      aria-pressed={micState === "recording"}
                      onClick={toggleMic}
                      disabled={busy || micState === "transcribing"}
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-50",
                        micState === "recording" &&
                          "border-destructive bg-destructive/10 text-destructive",
                      )}
                    >
                      {micState === "recording" ? (
                        <Square className="size-4 fill-current" />
                      ) : micState === "transcribing" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Mic className="size-4" />
                      )}
                    </button>
                  ) : null}
                  {voiceSupported ? (
                    <button
                      type="button"
                      aria-label={voiceEnabled ? a.voiceDisable : a.voiceEnable}
                      aria-pressed={voiceEnabled}
                      onClick={toggleVoice}
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl border border-border transition hover:bg-muted",
                        voiceEnabled
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {voiceEnabled ? (
                        <Volume2 className="size-4" />
                      ) : (
                        <VolumeX className="size-4" />
                      )}
                    </button>
                  ) : null}
                </div>
              ) : null}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (micError) setMicError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                rows={1}
                placeholder={a.inputPlaceholder}
                className="field max-h-28 min-h-9 flex-1 resize-none py-2 text-sm"
              />
              <button
                type="submit"
                aria-label={a.send}
                disabled={busy || !input.trim() || micState !== "idle"}
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
              >
                <SendHorizonal className="size-4" />
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AssistantMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* support agent */}
      <circle cx="12" cy="8.4" r="3.3" fill="currentColor" />
      <path
        d="M5.9 19.4c0-3.3 2.7-5.3 6.1-5.3s6.1 2 6.1 5.3c0 .5-.4.9-.9.9H6.8a.9.9 0 0 1-.9-.9Z"
        fill="currentColor"
      />
      {/* headset */}
      <path
        d="M5.4 13.2v-1.6a6.6 6.6 0 0 1 13.2 0v1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M5.4 12.4v2.5M18.6 12.4v2.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M18.6 14.9v.5a3.3 3.3 0 0 1-3.3 3.3h-1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
