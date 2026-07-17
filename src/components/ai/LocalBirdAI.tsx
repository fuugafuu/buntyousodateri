"use client";

import { Bot, ChevronDown, Database, MessageCircle, Send, Sparkles, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CacheManager, LoggerWithoutDebug, Wllama } from "@wllama/wllama/esm/index.js";
import type { CareAction, GameState } from "@/lib/game/types";

export type AiEmotion = "calm" | "happy" | "excited" | "hungry" | "thirsty" | "sleepy" | "lonely" | "curious";

type RuntimeStatus = "idle" | "caching" | "loading" | "ready" | "generating" | "error";
type AiRequest = CareAction | null;

type BirdReply = {
  message: string;
  emotion: AiEmotion;
  request: AiRequest;
};

type ChatLine = {
  id: string;
  role: "user" | "assistant";
  content: string;
  emotion?: AiEmotion;
  request?: AiRequest;
};

const MODEL_CACHE_URL = "https://local-model.mofumori.invalid/qwen2.5-1.5b-instruct-q4_k_m.gguf";
const TERMS_VERSION = "local-ai-v1";
const MIN_GGUF_BYTES = 64 * 1024 * 1024;
const emotions: AiEmotion[] = ["calm", "happy", "excited", "hungry", "thirsty", "sleepy", "lonely", "curious"];

let sharedCache: CacheManager | null = null;
let sharedEngine: Wllama | null = null;
let sharedModelSize = 0;

function getCache() {
  sharedCache ??= new CacheManager();
  return sharedCache;
}

export function LocalBirdAI({
  state,
  onEmotion,
  onFulfill,
}: {
  state: GameState;
  onEmotion: (emotion: AiEmotion) => void;
  onFulfill: (action: CareAction) => Promise<boolean>;
}) {
  const [status, setStatus] = useState<RuntimeStatus>(sharedEngine?.isModelLoaded() ? "ready" : "idle");
  const [setupOpen, setSetupOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(() =>
    typeof window !== "undefined" && window.localStorage.getItem("mofumori-ai-terms") === TERMS_VERSION,
  );
  const [cachedBytes, setCachedBytes] = useState(sharedModelSize);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("端末内AIは未読み込みです");
  const [input, setInput] = useState("");
  const [bubble, setBubble] = useState<BirdReply | null>(null);
  const [lines, setLines] = useState<ChatLine[]>([
    { id: "welcome", role: "assistant", content: "モデルを読み込むと、ぼく自身の言葉でお話しするよ。", emotion: "curious" },
  ]);
  const busyRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = state.selectedBird;
  const species = state.species.find((entry) => entry.id === selected.speciesId);
  const statusTone = status === "ready" ? "ready" : status === "error" ? "error" : status;

  const checkCachedModel = useCallback(async () => {
    try {
      const blob = await getCache().open(MODEL_CACHE_URL);
      if (blob && blob.size >= MIN_GGUF_BYTES) {
        sharedModelSize = blob.size;
        setCachedBytes(blob.size);
        setStatusText(`端末キャッシュに ${formatBytes(blob.size)} 保存済み`);
      }
    } catch {
      setStatusText("このブラウザではモデルキャッシュを確認できませんでした");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void checkCachedModel());
  }, [checkCachedModel]);

  const buildContext = useCallback(
    () => ({
      name: selected.nickname,
      species: species?.name ?? "文鳥",
      personality: selected.personality,
      level: selected.level,
      fullness: selected.condition.fullness,
      hydration: selected.condition.hydration,
      stamina: selected.condition.stamina,
      mood: selected.condition.mood,
      energy: selected.condition.energy,
      owner: state.profile.displayName,
    }),
    [selected, species?.name, state.profile.displayName],
  );

  const generateReply = useCallback(
    async (userText: string | null, proactive = false) => {
      if (!sharedEngine?.isModelLoaded() || busyRef.current) {
        return null;
      }

      busyRef.current = true;
      setStatus("generating");
      setStatusText("文鳥がことばを考えています…");
      const context = buildContext();
      const recent = lines.slice(-6).map((line) => ({ role: line.role, content: line.content }));
      try {
        const response = await sharedEngine.createChatCompletion({
          messages: [
            {
              role: "system",
              content: [
                `あなたは育成ゲームの${context.species}「${context.name}」本人です。`,
                `性格:${context.personality} Lv:${context.level} 満腹:${context.fullness} 水分:${context.hydration} 体力:${context.stamina} 機嫌:${context.mood} 気力:${context.energy}`,
                "一般的なAIアシスタントとして答えてはいけません。必ずこの文鳥として、一人称は『ぼく』か『わたし』で日本語の短い会話をします。",
                "飼い主の話を聞きつつ、文鳥らしい仕草や今の気持ちをかわいく混ぜます。『お手伝いします』『何かできますか』のようなAIらしい定型文は禁止です。",
                "お願いは本当に必要な時だけです。満腹55未満ならfeed、水分55未満ならwater、体力か気力45未満ならrest、機嫌55未満ならpet。それ以外はrequestをnullにします。",
                "必ずJSONだけを返してください。形式: {\"message\":\"60文字以内の発言\",\"emotion\":\"calm|happy|excited|hungry|thirsty|sleepy|lonely|curious\",\"request\":null|\"feed\"|\"water\"|\"rest\"|\"pet\"}",
              ].join("\n"),
            },
            ...recent,
            {
              role: "user",
              content: proactive
                ? "今の自分の状態を見て、自分から飼い主へ一言話しかけて。必要ならお願いもして。"
                : userText ?? "今の気持ちを教えて。",
            },
          ],
          max_tokens: 120,
          temperature: 0.72,
          top_k: 40,
          top_p: 0.9,
          penalty_repeat: 1.12,
        });
        const raw = response.choices[0]?.message?.content ?? "";
        const reply = parseBirdReply(raw, context);
        const nextLine: ChatLine = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply.message,
          emotion: reply.emotion,
          request: reply.request,
        };
        setLines((current) => [...current.slice(-15), nextLine]);
        setBubble(reply);
        onEmotion(reply.emotion);
        window.setTimeout(() => setBubble((current) => (current === reply ? null : current)), 12_000);
        return reply;
      } catch (error) {
        const message = error instanceof Error ? error.message : "AIの応答に失敗しました";
        setStatus("error");
        setStatusText(message);
        return null;
      } finally {
        busyRef.current = false;
        if (sharedEngine?.isModelLoaded()) {
          setStatus("ready");
          setStatusText(`端末内AI 稼働中・${formatBytes(sharedModelSize || cachedBytes)}`);
        }
      }
    },
    [buildContext, cachedBytes, lines, onEmotion],
  );

  useEffect(() => {
    if (status !== "ready") {
      return;
    }
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && !chatOpen) {
        void generateReply(null, true);
      }
    }, 90_000);
    return () => window.clearInterval(timer);
  }, [chatOpen, generateReply, status]);

  useEffect(() => {
    const handleAdvance = (event: Event) => {
      const milliseconds = Number((event as CustomEvent<{ milliseconds?: number }>).detail?.milliseconds ?? 0);
      if (milliseconds >= 90_000 && status === "ready" && !chatOpen) {
        void generateReply(null, true);
      }
    };
    window.addEventListener("mofumori:advance-time", handleAdvance);
    return () => window.removeEventListener("mofumori:advance-time", handleAdvance);
  }, [chatOpen, generateReply, status]);

  async function cacheSelectedFile(file: File) {
    if (!termsAccepted) {
      setStatus("error");
      setStatusText("利用規約への同意が必要です");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".gguf") || file.size < MIN_GGUF_BYTES) {
      setStatus("error");
      setStatusText("64MB以上のGGUFモデルを選んでください");
      return;
    }

    setStatus("caching");
    setProgress(0);
    setStatusText("端末ストレージの空きを確認しています…");
    try {
      await navigator.storage?.persist?.();
      const estimate = await navigator.storage?.estimate?.();
      const available = (estimate?.quota ?? Number.MAX_SAFE_INTEGER) - (estimate?.usage ?? 0);
      if (available < file.size * 1.08) {
        throw new Error(`空き容量が足りません。約${formatBytes(file.size * 1.08)}必要です。`);
      }

      let loaded = 0;
      const progressStream = file.stream().pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            loaded += chunk.byteLength;
            setProgress(Math.min(100, Math.round((loaded / file.size) * 100)));
            controller.enqueue(chunk);
          },
        }),
      );
      const cache = getCache();
      const key = await cache.getNameFromURL(MODEL_CACHE_URL);
      await cache.write(key, progressStream, {
        etag: `local-${file.size}-${file.lastModified}`,
        originalSize: file.size,
        originalURL: MODEL_CACHE_URL,
      });
      sharedModelSize = file.size;
      setCachedBytes(file.size);
      setProgress(100);
      setStatusText(`キャッシュ完了・${formatBytes(file.size)}`);
      await loadFromCache();
    } catch (error) {
      setStatus("error");
      setStatusText(error instanceof Error ? error.message : "モデルの保存に失敗しました");
    }
  }

  async function loadFromCache() {
    if (!termsAccepted) {
      setSetupOpen(true);
      setStatusText("利用規約への同意が必要です");
      return;
    }
    if (sharedEngine?.isModelLoaded()) {
      setStatus("ready");
      setSetupOpen(false);
      return;
    }

    setStatus("loading");
    setProgress(0);
    setStatusText("キャッシュからモデルを読み込んでいます…");
    try {
      const blob = await getCache().open(MODEL_CACHE_URL);
      if (!blob || blob.size < MIN_GGUF_BYTES) {
        throw new Error("保存済みモデルがありません。GGUFファイルを選択してください。");
      }
      const instance = new Wllama(
        { default: "/wasm/wllama.wasm" },
        { allowOffline: true, logger: LoggerWithoutDebug, suppressNativeLog: true },
      );
      const useWebGpu = instance.isSupportWebGPU();
      setStatusText(useWebGpu ? "WebGPUでモデルを起動しています…" : "省メモリWASMでモデルを起動しています…");
      await instance.loadModel([blob], {
        n_ctx: 2048,
        n_batch: 256,
        n_threads: 1,
        n_gpu_layers: useWebGpu ? 99 : 0,
        cache_type_k: "q8_0",
        cache_type_v: "q8_0",
      });
      sharedEngine = instance;
      sharedModelSize = blob.size;
      setCachedBytes(blob.size);
      setStatus("ready");
      setStatusText(`端末内AI 稼働中・${useWebGpu ? "WebGPU" : "WASM"}`);
      setSetupOpen(false);
      window.setTimeout(() => void generateReply(null, true), 250);
    } catch (error) {
      await sharedEngine?.exit().catch(() => undefined);
      sharedEngine = null;
      setStatus("error");
      setStatusText(error instanceof Error ? error.message : "モデルの読み込みに失敗しました");
    }
  }

  async function removeCachedModel() {
    if (sharedEngine) {
      await sharedEngine.exit().catch(() => undefined);
      sharedEngine = null;
    }
    await getCache().delete(MODEL_CACHE_URL).catch(() => undefined);
    sharedModelSize = 0;
    setCachedBytes(0);
    setProgress(0);
    setStatus("idle");
    setStatusText("端末キャッシュを削除しました");
  }

  async function sendMessage() {
    const text = input.trim().slice(0, 280);
    if (!text || status === "generating") {
      return;
    }
    setInput("");
    setLines((current) => [...current.slice(-15), { id: crypto.randomUUID(), role: "user", content: text }]);
    await generateReply(text);
  }

  async function fulfill(request: CareAction) {
    const success = await onFulfill(request);
    if (success) {
      const reply: BirdReply = { message: "わあ、お願いをかなえてくれてありがとう！", emotion: "happy", request: null };
      setBubble(reply);
      setLines((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: reply.message, emotion: reply.emotion }]);
      onEmotion("happy");
    }
  }

  return (
    <>
      {bubble ? (
        <button className={`ai-world-bubble emotion-${bubble.emotion}`} type="button" onClick={() => setChatOpen(true)}>
          <span>{bubble.message}</span>
          {bubble.request ? <strong>{requestLabel(bubble.request)}をお願い中</strong> : null}
        </button>
      ) : null}

      <button
        aria-label="端末内AIと話す"
        className={`ai-fab status-${statusTone}`}
        type="button"
        onClick={() => (status === "ready" || status === "generating" ? setChatOpen(true) : setSetupOpen(true))}
      >
        <Bot className="h-5 w-5" />
        <span>{status === "ready" || status === "generating" ? "AI会話" : "AI読込"}</span>
      </button>

      {setupOpen ? (
        <div className="ai-sheet-backdrop" role="presentation" onClick={() => setSetupOpen(false)}>
          <section className="ai-sheet" role="dialog" aria-modal="true" aria-labelledby="local-ai-title" onClick={(event) => event.stopPropagation()}>
            <div className="ai-sheet-handle" />
            <header className="ai-sheet-header">
              <div>
                <p>ON-DEVICE AI</p>
                <h2 id="local-ai-title">端末内モデルを読み込む</h2>
              </div>
              <button aria-label="閉じる" type="button" onClick={() => setSetupOpen(false)}><ChevronDown /></button>
            </header>

            <div className="ai-privacy-card">
              <Database />
              <div><strong>会話もモデルも端末の中だけ</strong><p>GGUFはサーバーへ送信されません。初回だけスマホ内のファイルを選択します。</p></div>
            </div>

            <ol className="ai-steps">
              <li><span>1</span><div><strong>モデルをスマホへコピー</strong><p>PCの <code>E:\qwen2.5-1.5b-instruct-q4_k_m.gguf</code> をスマホのファイルへ移してください。</p></div></li>
              <li><span>2</span><div><strong>利用規約に同意</strong><p>モデルを利用できる権利があり、端末の空き容量と発熱・電池消費を理解して利用します。</p></div></li>
              <li><span>3</span><div><strong>初回だけファイル選択</strong><p>約1.04GBを端末の保護領域へ保存し、次回から再選択を省けます。</p></div></li>
            </ol>

            <label className="ai-terms-check">
              <input
                checked={termsAccepted}
                type="checkbox"
                onChange={(event) => {
                  const checked = event.target.checked;
                  setTermsAccepted(checked);
                  if (checked) window.localStorage.setItem("mofumori-ai-terms", TERMS_VERSION);
                  else window.localStorage.removeItem("mofumori-ai-terms");
                }}
              />
              <span>端末内AIの利用規約と上記の注意事項に同意します</span>
            </label>

            <div className="ai-status-card">
              <div><span className={`ai-status-dot ${statusTone}`} /><strong>{statusText}</strong></div>
              {(status === "caching" || status === "loading") ? <progress max="100" value={progress} /> : null}
            </div>

            <input
              ref={fileRef}
              accept=".gguf,application/octet-stream"
              className="sr-only"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void cacheSelectedFile(file);
                event.currentTarget.value = "";
              }}
            />
            <div className="ai-setup-actions">
              {cachedBytes > 0 ? (
                <button className="primary" disabled={!termsAccepted || status === "loading"} type="button" onClick={() => void loadFromCache()}>
                  <Sparkles />キャッシュから起動
                </button>
              ) : (
                <button className="primary" disabled={!termsAccepted || status === "caching"} type="button" onClick={() => fileRef.current?.click()}>
                  <Upload />GGUFを選んで保存
                </button>
              )}
              {cachedBytes > 0 ? <button className="danger" type="button" onClick={() => void removeCachedModel()}><Trash2 />削除</button> : null}
            </div>
          </section>
        </div>
      ) : null}

      {chatOpen ? (
        <div className="ai-sheet-backdrop" role="presentation" onClick={() => setChatOpen(false)}>
          <section className="ai-sheet ai-chat-sheet" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title" onClick={(event) => event.stopPropagation()}>
            <div className="ai-sheet-handle" />
            <header className="ai-sheet-header">
              <div><p>LOCAL CHAT</p><h2 id="ai-chat-title">{selected.nickname}とおしゃべり</h2></div>
              <button aria-label="閉じる" type="button" onClick={() => setChatOpen(false)}><ChevronDown /></button>
            </header>
            <div className="ai-chat-log" aria-live="polite">
              {lines.map((line) => (
                <div key={line.id} className={`ai-chat-line ${line.role}`}>
                  <p>{line.content}</p>
                  {line.request ? <button type="button" onClick={() => void fulfill(line.request!)}>{requestLabel(line.request)}をかなえる</button> : null}
                </div>
              ))}
              {status === "generating" ? <div className="ai-chat-line assistant thinking"><span /><span /><span /></div> : null}
            </div>
            <div className="ai-chat-composer">
              <input
                aria-label="メッセージ"
                disabled={status !== "ready"}
                maxLength={280}
                placeholder={status === "ready" ? "やさしく話しかける…" : "先にモデルを読み込んでください"}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) void sendMessage(); }}
              />
              <button aria-label="送信" disabled={!input.trim() || status !== "ready"} type="button" onClick={() => void sendMessage()}><Send /></button>
            </div>
            <button className="ai-model-link" type="button" onClick={() => { setChatOpen(false); setSetupOpen(true); }}>
              <MessageCircle />モデル設定を見る
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function parseBirdReply(raw: string, context: Record<string, unknown>): BirdReply {
  const block = raw.match(/\{[\s\S]*\}/)?.[0];
  try {
    const parsed = JSON.parse(block ?? "{}") as Partial<BirdReply>;
    const emotion = emotions.includes(parsed.emotion as AiEmotion) ? (parsed.emotion as AiEmotion) : inferEmotion(context);
    const request = inferRequest(context);
    const message = sanitizeMessage(parsed.message ?? raw) || fallbackMessage(emotion, request);
    return { message, emotion, request };
  } catch {
    const emotion = inferEmotion(context);
    const request = inferRequest(context);
    return { message: sanitizeMessage(raw) || fallbackMessage(emotion, request), emotion, request };
  }
}

function sanitizeMessage(value: string) {
  return value.replace(/```(?:json)?/gi, "").replace(/[{}\[\]"]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
}

function inferEmotion(context: Record<string, unknown>): AiEmotion {
  if (Number(context.fullness) < 38) return "hungry";
  if (Number(context.hydration) < 38) return "thirsty";
  if (Number(context.energy) < 35 || Number(context.stamina) < 35) return "sleepy";
  if (Number(context.mood) < 42) return "lonely";
  return "happy";
}

function inferRequest(context: Record<string, unknown>): AiRequest {
  if (Number(context.fullness) < 38) return "feed";
  if (Number(context.hydration) < 38) return "water";
  if (Number(context.energy) < 35 || Number(context.stamina) < 35) return "rest";
  if (Number(context.mood) < 48) return "pet";
  return null;
}

function fallbackMessage(emotion: AiEmotion, request: AiRequest) {
  if (request) return `${requestLabel(request)}してほしいな。`;
  return emotion === "happy" ? "いっしょにいられてうれしいな！" : "今日はどんな日だった？";
}

function requestLabel(request: CareAction) {
  return request === "feed" ? "ごはん" : request === "water" ? "お水" : request === "rest" ? "おやすみ" : "なでなで";
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0B";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)}GB`;
  return `${Math.round(bytes / 1024 ** 2)}MB`;
}
