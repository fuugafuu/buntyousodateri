"use client";

import clsx from "clsx";
import { Check, Cloud, Copy, Gift, Inbox, Medal, RefreshCw, Send, Sparkles, UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { SocialBirdCard, SocialDashboard } from "@/lib/social/types";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };
type SocialTab = "grow" | "friends" | "ranking";

export function SocialHub({ onGameStateChanged }: { onGameStateChanged: () => Promise<void> }) {
  const [dashboard, setDashboard] = useState<SocialDashboard | null>(null);
  const [tab, setTab] = useState<SocialTab>("grow");
  const [playerId, setPlayerId] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<SocialBirdCard | null>(null);
  const [giftItem, setGiftItem] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setBusy("load");
    setError(null);
    try {
      setDashboard(await api<SocialDashboard>("/api/social/dashboard"));
    } catch (caught) {
      setError(getMessage(caught));
    } finally {
      setBusy(null);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  async function addFriend(input = playerId) {
    if (!input.trim()) return;
    setBusy("friend");
    setError(null);
    setMessage(null);
    try {
      const next = await api<SocialDashboard>("/api/social/friends", { playerId: input });
      setDashboard(next);
      setPlayerId("");
      setMessage("フレンドになりました。相手の文鳥を見に行けます！");
    } catch (caught) {
      setError(getMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function sendGift() {
    if (!selectedFriend || !giftItem) return;
    setBusy("gift");
    setError(null);
    try {
      const next = await api<SocialDashboard>("/api/social/gifts", {
        friendPlayerId: selectedFriend.playerId,
        itemCode: giftItem,
        quantity: 1,
      });
      setDashboard(next);
      setSelectedFriend(null);
      setGiftItem("");
      setMessage(`${selectedFriend.displayName}さんへ仕送りしました。`);
      await onGameStateChanged();
    } catch (caught) {
      setError(getMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function claimGift(giftId: string) {
    setBusy(`claim-${giftId}`);
    setError(null);
    try {
      const next = await api<SocialDashboard>("/api/social/gifts/claim", { giftId });
      setDashboard(next);
      setMessage("仕送りを受け取りました。持ちものに追加されています！");
      await onGameStateChanged();
    } catch (caught) {
      setError(getMessage(caught));
    } finally {
      setBusy(null);
    }
  }

  async function copyId() {
    if (!dashboard) return;
    await navigator.clipboard.writeText(dashboard.me.playerId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!dashboard) {
    return (
      <div className="grid min-h-[650px] place-items-center p-6 text-center">
        <div>
          <Users className="mx-auto h-10 w-10 text-[var(--leaf)]" />
          <p className="mt-3 font-bold">みんなの止まり木を準備中</p>
          {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
          {error ? <button className="mt-4 border border-[var(--leaf)] px-4 py-2 text-sm font-bold text-[var(--leaf)]" type="button" onClick={() => void load()}>再読み込み</button> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[780px] bg-[#f3f8f4] pb-8">
      <header className="relative overflow-hidden bg-[#173d2d] px-4 pb-5 pt-16 text-white">
        <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#4ca274]/25" />
        <p className="text-xs font-black tracking-[.16em] text-[#aee0c4]">SOCIAL PERCH</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div><h1 className="text-2xl font-black">みんなの止まり木</h1><p className="mt-1 text-xs text-white/70">育てる・つながる・贈りあう</p></div>
          <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold">
            <Cloud className="h-3 w-3" />{dashboard.cloudEnabled ? "クラウド同期" : "デモ同期"}
          </span>
        </div>
        <button className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-left" type="button" onClick={() => void copyId()}>
          <span><span className="block text-[10px] font-bold text-white/60">あなたのプレイヤーID</span><strong className="font-mono tracking-wider">{dashboard.me.playerId}</strong></span>
          {copied ? <Check className="h-5 w-5 text-[#8ee6b5]" /> : <Copy className="h-5 w-5" />}
        </button>
      </header>

      <nav className="grid grid-cols-3 border-b border-[var(--line)] bg-white p-2">
        {([[
          "grow", "育成", Sparkles,
        ], ["friends", "フレンド", Users], ["ranking", "ランキング", Medal]] as const).map(([value, label, Icon]) => (
          <button key={value} className={clsx("flex h-11 items-center justify-center gap-1.5 text-xs font-bold", tab === value ? "bg-[#e8f4ec] text-[var(--leaf-dark)]" : "text-[var(--muted)]")} type="button" onClick={() => setTab(value)}><Icon className="h-4 w-4" />{label}</button>
        ))}
      </nav>

      <div className="p-4">
        {message ? <div className="mb-3 border border-[#a8d8bb] bg-[#eef9f2] p-3 text-xs font-bold text-[var(--leaf-dark)]">{message}</div> : null}
        {error ? <div className="mb-3 flex items-center justify-between gap-2 border border-[#e4baba] bg-[#fff4f3] p-3 text-xs font-bold text-[var(--danger)]"><span>{error}</span><button aria-label="閉じる" type="button" onClick={() => setError(null)}><X className="h-4 w-4" /></button></div> : null}

        {tab === "grow" ? (
          <>
            <section className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-black tracking-widest text-[var(--leaf)]">BOND RANK</p><h2 className="text-xl font-black">{dashboard.bond.title}</h2></div><div className="text-right"><strong className="text-2xl text-[var(--coral)]">{dashboard.bond.streakDays}</strong><span className="block text-[10px] text-[var(--muted)]">日連続</span></div></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7eee9]"><div className="h-full rounded-full bg-gradient-to-r from-[var(--leaf)] to-[#66ba83]" style={{ width: `${Math.min(100, dashboard.bond.score / dashboard.bond.nextAt * 100)}%` }} /></div>
              <p className="mt-1 text-right text-[10px] font-bold text-[var(--muted)]">絆 {dashboard.bond.score} / {dashboard.bond.nextAt}</p>
            </section>

            <h2 className="mt-5 text-base font-black">今日の育成クエスト</h2>
            <div className="mt-2 grid gap-2">
              {dashboard.missions.map((mission) => (
                <div key={mission.id} className="flex items-center gap-3 border border-[var(--line)] bg-white p-3">
                  <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-full", mission.complete ? "bg-[var(--leaf)] text-white" : "bg-[#edf2ee] text-[var(--muted)]")}>{mission.complete ? <Check className="h-5 w-5" /> : <Sparkles className="h-4 w-4" />}</span>
                  <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><strong className="text-sm">{mission.label}</strong><span className="text-[10px] font-black text-[var(--leaf)]">{mission.current}/{mission.target}</span></div><p className="mt-0.5 text-[11px] text-[var(--muted)]">{mission.detail}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6ece8]"><div className="h-full bg-[var(--sun)]" style={{ width: `${Math.min(100, mission.current / mission.target * 100)}%` }} /></div></div>
                </div>
              ))}
            </div>

            <h2 className="mt-5 flex items-center gap-2 text-base font-black"><Inbox className="h-5 w-5" />届いた仕送り <span className="rounded-full bg-[var(--coral)] px-2 py-0.5 text-[10px] text-white">{dashboard.inbox.length}</span></h2>
            <div className="mt-2 grid gap-2">
              {dashboard.inbox.length ? dashboard.inbox.map((gift) => (
                <div key={gift.id} className="flex items-center gap-3 border border-[var(--line)] bg-white p-3">
                  <span className="relative h-12 w-12 shrink-0"><Image alt="" fill className="object-contain" src={gift.itemAsset} /></span>
                  <div className="min-w-0 flex-1"><strong className="block text-sm">{gift.itemName} ×{gift.quantity}</strong><span className="text-[11px] text-[var(--muted)]">{gift.senderName}さんから</span></div>
                  <button className="bg-[var(--leaf)] px-3 py-2 text-xs font-black text-white disabled:opacity-50" disabled={busy === `claim-${gift.id}`} type="button" onClick={() => void claimGift(gift.id)}>受取</button>
                </div>
              )) : <p className="border border-dashed border-[var(--line)] bg-white p-4 text-center text-xs text-[var(--muted)]">届いた仕送りはまだありません。</p>}
            </div>
          </>
        ) : null}

        {tab === "friends" ? (
          <>
            <section className="border border-[var(--line)] bg-white p-3">
              <label className="text-xs font-black" htmlFor="friend-id">プレイヤーIDでフレンド追加</label>
              <div className="mt-2 flex gap-2"><input id="friend-id" className="h-11 min-w-0 flex-1 border border-[var(--line)] px-3 font-mono text-sm uppercase" maxLength={24} placeholder="BF-XXXXXXXX" value={playerId} onChange={(event) => setPlayerId(event.target.value)} /><button aria-label="フレンド追加" className="grid h-11 w-11 place-items-center bg-[var(--leaf)] text-white disabled:opacity-50" disabled={!playerId.trim() || busy === "friend"} type="button" onClick={() => void addFriend()}><UserPlus className="h-5 w-5" /></button></div>
              {!dashboard.cloudEnabled ? <div className="mt-2 flex flex-wrap gap-1">{dashboard.suggestedPlayerIds.map((id) => <button key={id} className="border border-[var(--line)] px-2 py-1 font-mono text-[9px] text-[var(--muted)]" type="button" onClick={() => void addFriend(id)}>{id}</button>)}</div> : null}
            </section>

            <div className="mt-4 flex items-center justify-between"><h2 className="text-base font-black">フレンドの文鳥</h2><button aria-label="更新" className="text-[var(--leaf)]" type="button" onClick={() => void load()}><RefreshCw className={clsx("h-4 w-4", busy === "load" && "animate-spin")} /></button></div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {dashboard.friends.length ? dashboard.friends.map((friend) => (
                <button key={friend.playerId} className="overflow-hidden border border-[var(--line)] bg-white text-left shadow-sm" type="button" onClick={() => setSelectedFriend(friend)}>
                  <span className="relative block h-28 bg-gradient-to-b from-[#eff8f2] to-[#e4f0e8]"><Image alt={friend.birdName} fill className="object-contain p-2" src={friend.birdAsset} /></span>
                  <span className="block p-2"><strong className="block truncate text-sm">{friend.birdName}</strong><span className="block truncate text-[10px] text-[var(--muted)]">{friend.displayName}・Lv.{friend.birdLevel}</span><span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[var(--coral)]"><Gift className="h-3 w-3" />仕送り・見に行く</span></span>
                </button>
              )) : <p className="col-span-2 border border-dashed border-[var(--line)] bg-white p-5 text-center text-xs text-[var(--muted)]">IDを入力して、最初のフレンドを追加しよう。</p>}
            </div>
          </>
        ) : null}

        {tab === "ranking" ? (
          <>
            <div className="flex items-end justify-between"><div><p className="text-xs font-bold text-[var(--muted)]">育成スコアランキング</p><h2 className="text-xl font-black">あなたは {dashboard.me.rank} 位</h2></div><Medal className="h-8 w-8 text-[var(--sun)]" /></div>
            <div className="mt-4 grid gap-2">
              {dashboard.leaderboard.map((entry) => (
                <div key={entry.playerId} className={clsx("flex items-center gap-3 border p-2.5", entry.playerId === dashboard.me.playerId ? "border-[var(--leaf)] bg-[#edf8f1]" : "border-[var(--line)] bg-white")}>
                  <strong className={clsx("grid h-8 w-8 place-items-center text-sm", entry.rank <= 3 ? "rounded-full bg-[var(--sun)] text-white" : "text-[var(--muted)]")}>{entry.rank}</strong>
                  <span className="relative h-11 w-11 shrink-0 rounded-full bg-[#edf3ef]"><Image alt="" fill className="object-contain" src={entry.birdAsset} /></span>
                  <div className="min-w-0 flex-1"><strong className="block truncate text-sm">{entry.birdName} <span className="text-[10px] text-[var(--muted)]">Lv.{entry.birdLevel}</span></strong><span className="block truncate text-[10px] text-[var(--muted)]">{entry.displayName}</span></div>
                  <strong className="text-sm text-[var(--leaf-dark)]">{entry.score.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {selectedFriend ? (
        <div className="absolute inset-0 z-50 flex items-end bg-[#102018]/55" role="presentation" onClick={() => setSelectedFriend(null)}>
          <section className="max-h-[92%] w-full overflow-y-auto rounded-t-3xl bg-[#fffdf8] p-4 pb-7 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="friend-bird-title" onClick={(event) => event.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[#cbd8d0]" />
            <div className="flex items-start justify-between"><div><p className="text-[10px] font-black tracking-widest text-[var(--leaf)]">FRIEND&apos;S BIRD</p><h2 id="friend-bird-title" className="text-xl font-black">{selectedFriend.birdName}</h2><p className="text-xs text-[var(--muted)]">{selectedFriend.displayName}さん・Lv.{selectedFriend.birdLevel}</p></div><button aria-label="閉じる" type="button" onClick={() => setSelectedFriend(null)}><X /></button></div>
            <div className="relative mx-auto h-44 w-44"><Image alt={selectedFriend.birdName} fill className="object-contain" src={selectedFriend.birdAsset} /></div>
            <div className="rounded-xl bg-[#eff7f2] p-3 text-center"><p className="text-xs text-[var(--muted)]">育成スコア</p><strong className="text-2xl text-[var(--leaf-dark)]">{selectedFriend.score.toLocaleString()}</strong></div>
            <label className="mt-4 block text-xs font-black" htmlFor="gift-item">持ちものから1個仕送り</label>
            <div className="mt-2 flex gap-2"><select id="gift-item" className="h-12 min-w-0 flex-1 border border-[var(--line)] bg-white px-3 text-sm" value={giftItem} onChange={(event) => setGiftItem(event.target.value)}><option value="">アイテムを選択</option>{dashboard.inventory.map((item) => <option key={item.itemCode} value={item.itemCode}>{item.name}（所持 {item.quantity}）</option>)}</select><button className="flex h-12 items-center gap-2 bg-[var(--coral)] px-4 text-sm font-black text-white disabled:opacity-50" disabled={!giftItem || busy === "gift"} type="button" onClick={() => void sendGift()}><Send className="h-4 w-4" />送る</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

async function api<T>(url: string, body?: unknown) {
  const response = await fetch(url, body === undefined ? { cache: "no-store" } : {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json() as ApiResult<T>;
  if (!response.ok || !payload.ok) throw new Error(payload.ok ? "通信に失敗しました。" : payload.message);
  return payload.data;
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "処理に失敗しました。";
}
