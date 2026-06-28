"use client";

import clsx from "clsx";
import {
  BookOpen,
  Coins,
  Droplets,
  Heart,
  Home,
  Leaf,
  LogOut,
  Pause,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Swords,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BattleMode,
  BattleRoom,
  BirdSpecies,
  CareAction,
  GameState,
  ItemMaster,
  OwnedBird,
} from "@/lib/game/types";

type Screen = "home" | "encyclopedia" | "shop" | "battle";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

const navItems: Array<{ href: string; screen: Screen; label: string; Icon: typeof Home }> = [
  { href: "/", screen: "home", label: "ホーム", Icon: Home },
  { href: "/encyclopedia", screen: "encyclopedia", label: "図鑑", Icon: BookOpen },
  { href: "/shop", screen: "shop", label: "ショップ", Icon: ShoppingBag },
  { href: "/battle", screen: "battle", label: "バトル", Icon: Swords },
];

const statLabels = {
  speed: "素早さ",
  voice: "鳴き声",
  flight: "飛行速度",
  clingy: "甘えん坊",
  appetite: "食欲",
};

const conditionLabels = {
  fullness: "満腹",
  hydration: "水分",
  stamina: "体力",
  mood: "機嫌",
  energy: "気力",
};

export function GameApp({ screen }: { screen: Screen }) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(true);
  const [noticeOn, setNoticeOn] = useState(false);
  const [gachaResultIds, setGachaResultIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const next = await apiGet<GameState>("/api/game/state");
      setState(next);
      setError(null);
    } catch (caught) {
      setError(getMessage(caught));
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const selectedSpecies = useMemo(() => {
    if (!state) {
      return null;
    }
    return state.species.find((entry) => entry.id === state.selectedBird.speciesId) ?? state.species[0];
  }, [state]);

  const runMutation = useCallback(async <T,>(label: string, action: () => Promise<T>) => {
    setBusy(label);
    setError(null);
    try {
      return await action();
    } catch (caught) {
      setError(getMessage(caught));
      return null;
    } finally {
      setBusy(null);
    }
  }, []);

  if (!state || !selectedSpecies) {
    return (
      <AppChrome
        activeScreen={screen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        bgmOn={bgmOn}
        setBgmOn={setBgmOn}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        noticeOn={noticeOn}
        setNoticeOn={setNoticeOn}
      >
        <div className="grid min-h-[520px] place-items-center px-8 text-center">
          {error ? (
            <div className="w-full border border-[var(--danger)] bg-white p-5 text-left">
              <ShieldCheck className="mb-4 h-9 w-9 text-[var(--danger)]" />
              <p className="font-bold text-[var(--danger)]">読み込みに失敗しました</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{error}</p>
              <button
                className="mt-4 h-11 w-full border border-[var(--leaf)] bg-[var(--leaf)] text-sm font-bold text-white"
                type="button"
                onClick={() => void load()}
              >
                再読み込み
              </button>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                認証を使わないローカル確認では ALLOW_DEMO_AUTH を未設定または true にしてください。
              </p>
            </div>
          ) : (
            <div>
              <Sparkles className="mx-auto mb-4 h-9 w-9 text-[var(--sun)]" />
              <p className="font-semibold">読み込み中</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                文鳥の止まり木を整えています。
              </p>
            </div>
          )}
        </div>
      </AppChrome>
    );
  }

  return (
    <AppChrome
      activeScreen={screen}
      settingsOpen={settingsOpen}
      setSettingsOpen={setSettingsOpen}
      bgmOn={bgmOn}
      setBgmOn={setBgmOn}
      soundOn={soundOn}
      setSoundOn={setSoundOn}
      noticeOn={noticeOn}
      setNoticeOn={setNoticeOn}
    >
      {error ? (
        <div className="mx-4 mt-4 border border-[var(--danger)] bg-white p-3 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      ) : null}
      {screen === "home" ? (
        <HomeScreen state={state} species={selectedSpecies} busy={busy} runMutation={runMutation} setState={setState} />
      ) : null}
      {screen === "encyclopedia" ? (
        <EncyclopediaScreen state={state} busy={busy} runMutation={runMutation} setState={setState} />
      ) : null}
      {screen === "shop" ? (
        <ShopScreen
          state={state}
          busy={busy}
          resultIds={gachaResultIds}
          setResultIds={setGachaResultIds}
          runMutation={runMutation}
          setState={setState}
        />
      ) : null}
      {screen === "battle" ? (
        <BattleScreen state={state} busy={busy} runMutation={runMutation} setState={setState} />
      ) : null}
    </AppChrome>
  );
}

function AppChrome({
  activeScreen,
  children,
  settingsOpen,
  setSettingsOpen,
  bgmOn,
  setBgmOn,
  soundOn,
  setSoundOn,
  noticeOn,
  setNoticeOn,
}: {
  activeScreen: Screen;
  children: React.ReactNode;
  settingsOpen: boolean;
  setSettingsOpen: (value: boolean) => void;
  bgmOn: boolean;
  setBgmOn: (value: boolean) => void;
  soundOn: boolean;
  setSoundOn: (value: boolean) => void;
  noticeOn: boolean;
  setNoticeOn: (value: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[var(--background)] px-2 py-3 text-[var(--foreground)] sm:px-4">
      <section className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[480px] flex-col overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-sm">
        <button
          aria-label="設定を開く"
          className="absolute left-3 top-3 z-30 grid h-11 w-11 place-items-center border border-[var(--line)] bg-white/92 text-[var(--leaf-dark)] shadow-sm transition hover:bg-white"
          type="button"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="game-scrollbar flex-1 overflow-y-auto pb-24">{children}</div>
        <nav className="absolute bottom-0 left-0 right-0 z-30 grid h-20 grid-cols-4 border-t border-[var(--line)] bg-white/96 px-2 py-2 backdrop-blur">
          {navItems.map(({ href, screen, label, Icon }) => {
            const active = activeScreen === screen || pathname === href;
            return (
              <Link
                key={href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "grid min-w-0 place-items-center gap-1 text-xs font-semibold text-[var(--muted)] transition",
                  active && "scale-110 text-[var(--leaf-dark)]",
                )}
                href={href}
              >
                <span
                  className={clsx(
                    "grid h-10 w-10 place-items-center border transition",
                    active
                      ? "border-[var(--leaf)] bg-[var(--leaf)] text-white"
                      : "border-transparent bg-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
        {settingsOpen ? (
          <div className="absolute inset-0 z-40 bg-[#17211c]/42" onClick={() => setSettingsOpen(false)}>
            <aside
              className="absolute bottom-0 left-0 right-0 border-t border-[var(--line)] bg-white p-4 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">設定</h2>
                <button
                  className="border border-[var(--line)] px-3 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                >
                  閉じる
                </button>
              </div>
              <ToggleRow checked={bgmOn} icon={<Volume2 className="h-4 w-4" />} label="BGM" setChecked={setBgmOn} />
              <ToggleRow checked={soundOn} icon={<Waves className="h-4 w-4" />} label="SE" setChecked={setSoundOn} />
              <ToggleRow checked={noticeOn} icon={<ShieldCheck className="h-4 w-4" />} label="通知" setChecked={setNoticeOn} />
              <Link
                className="mt-3 flex h-11 items-center justify-center gap-2 border border-[var(--line)] text-sm font-semibold text-[var(--muted)]"
                href="/api/auth/signout"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </Link>
              <p className="mt-3 text-xs text-[var(--muted)]">version 0.1.0 / デモモード対応</p>
            </aside>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ToggleRow({
  checked,
  icon,
  label,
  setChecked,
}: {
  checked: boolean;
  icon: React.ReactNode;
  label: string;
  setChecked: (value: boolean) => void;
}) {
  return (
    <label className="mb-2 flex h-12 items-center justify-between border border-[var(--line)] px-3">
      <span className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
      </span>
      <input
        checked={checked}
        className="h-5 w-5 accent-[var(--leaf)]"
        type="checkbox"
        onChange={(event) => setChecked(event.target.checked)}
      />
    </label>
  );
}

function HomeScreen({
  state,
  species,
  busy,
  runMutation,
  setState,
}: {
  state: GameState;
  species: BirdSpecies;
  busy: string | null;
  runMutation: <T>(label: string, action: () => Promise<T>) => Promise<T | null>;
  setState: (state: GameState) => void;
}) {
  const selected = state.selectedBird;
  const inventoryItems = state.inventory
    .filter((entry) => entry.quantity > 0)
    .map((entry) => ({
      ...entry,
      master: state.items.find((item) => item.code === entry.itemCode),
    }))
    .filter((entry): entry is { itemCode: string; quantity: number; master: ItemMaster } => Boolean(entry.master));

  async function care(action: CareAction) {
    const next = await runMutation(`care-${action}`, () =>
      apiPost<GameState>("/api/game/care", { action }),
    );
    if (next) {
      setState(next);
    }
  }

  async function consumeOwnedItem(itemCode: string) {
    const next = await runMutation(`use-${itemCode}`, () =>
      apiPost<GameState>("/api/game/item/use", { itemCode, birdId: selected.id }),
    );
    if (next) {
      setState(next);
    }
  }

  async function refreshState() {
    const next = await runMutation("refresh-state", () => apiGet<GameState>("/api/game/state"));
    if (next) {
      setState(next);
    }
  }

  return (
    <div className="relative min-h-[780px]">
      <div className="relative h-[310px] overflow-hidden border-b border-[var(--line)]">
        <AssetImage alt="" className="object-cover" fill priority src="/images/ui/home-room.svg" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17211c]/58 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{species.name}</p>
            <h1 className="truncate text-3xl font-bold">{selected.nickname}</h1>
          </div>
          <div className="flex h-11 shrink-0 items-center gap-2 border border-white/45 bg-white/18 px-3 font-bold backdrop-blur">
            <Coins className="h-5 w-5 text-[var(--sun)]" />
            {state.profile.coins}
          </div>
        </div>
        <div className="absolute bottom-2 right-5 z-10 h-48 w-48">
          <AssetImage alt={selected.nickname} className="object-contain drop-shadow-lg" fill priority src={species.asset} />
        </div>
      </div>

      <section className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(selected.condition)
            .filter(([key]) => key !== "lastUpdatedAt")
            .map(([key, value]) => (
              <ConditionMeter key={key} label={conditionLabels[key as keyof typeof conditionLabels]} value={Number(value)} />
            ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <CareButton busy={busy === "care-feed"} icon={<Leaf />} label="餌" onClick={() => care("feed")} />
          <CareButton busy={busy === "care-water"} icon={<Droplets />} label="水" onClick={() => care("water")} />
          <CareButton busy={busy === "care-rest"} icon={<Pause />} label="休む" onClick={() => care("rest")} />
          <CareButton busy={busy === "care-pet"} icon={<Heart />} label="なでる" onClick={() => care("pet")} />
        </div>

        <h2 className="mt-5 text-base font-bold">ステータス</h2>
        <div className="mt-2 grid gap-2">
          {Object.entries(selected.stats).map(([key, value]) => (
            <StatBar key={key} label={statLabels[key as keyof typeof statLabels]} value={value} />
          ))}
        </div>

        <h2 className="mt-5 text-base font-bold">持ちもの</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {inventoryItems.length > 0 ? (
            inventoryItems.map(({ itemCode, quantity, master }) => (
              <button
                key={itemCode}
                className="flex min-h-24 items-center gap-3 border border-[var(--line)] bg-white p-2 text-left transition hover:border-[var(--leaf)]"
                type="button"
                onClick={() => consumeOwnedItem(itemCode)}
              >
                <span className="relative block h-14 w-14 shrink-0">
                  <AssetImage alt="" className="object-contain" fill src={master.asset} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{master.name}</span>
                  <span className="block text-xs text-[var(--muted)]">x{quantity}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="col-span-2 border border-[var(--line)] bg-white p-4 text-sm text-[var(--muted)]">
              アイテムはショップで購入できます。
            </p>
          )}
        </div>

        {state.pendingConsumptions.length > 0 ? (
          <div className="mt-4 border border-[var(--line)] bg-white p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold">食べている途中</p>
              <button
                className="border border-[var(--line)] px-2 py-1 text-xs font-bold text-[var(--leaf-dark)]"
                disabled={busy === "refresh-state"}
                type="button"
                onClick={refreshState}
              >
                更新
              </button>
            </div>
            {state.pendingConsumptions.map((entry) => {
              const master = state.items.find((item) => item.code === entry.itemCode);
              return (
                <p key={entry.id} className="mt-1 text-[var(--muted)]">
                  {master?.name ?? entry.itemCode} / 完了 {new Date(entry.completesAt).toLocaleTimeString()}
                </p>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function EncyclopediaScreen({
  state,
  busy,
  runMutation,
  setState,
}: {
  state: GameState;
  busy: string | null;
  runMutation: <T>(label: string, action: () => Promise<T>) => Promise<T | null>;
  setState: (state: GameState) => void;
}) {
  const [tab, setTab] = useState<"pets" | "book">("pets");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const ownedSpeciesIds = new Set(state.ownedBirds.map((bird) => bird.speciesId));

  async function select(birdId: string) {
    const next = await runMutation(`select-${birdId}`, () =>
      apiPost<GameState>("/api/game/bird/select", { birdId }),
    );
    if (next) {
      setState(next);
    }
  }

  async function rename(birdId: string) {
    const next = await runMutation(`rename-${birdId}`, () =>
      apiPost<GameState>("/api/game/bird/rename", { birdId, nickname }),
    );
    if (next) {
      setState(next);
      setEditingId(null);
      setNickname("");
    }
  }

  return (
    <section className="px-4 pb-4 pt-20">
      <Header title="図鑑" subtitle="ペットと種類を確認" />
      <div className="mt-4 grid grid-cols-2 border border-[var(--line)] bg-white p-1">
        <Segment active={tab === "pets"} label="ペット" onClick={() => setTab("pets")} />
        <Segment active={tab === "book"} label="図鑑" onClick={() => setTab("book")} />
      </div>
      {tab === "pets" ? (
        <div className="mt-4 grid gap-3">
          {state.ownedBirds.map((bird) => {
            const birdSpecies = state.species.find((entry) => entry.id === bird.speciesId)!;
            return (
              <article key={bird.id} className="border border-[var(--line)] bg-white p-3">
                <div className="flex gap-3">
                  <div className="relative h-24 w-24 shrink-0 bg-[var(--background)]">
                    <AssetImage alt="" className="object-contain" fill src={birdSpecies.asset} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="truncate text-base font-bold">{bird.nickname}</h3>
                        <p className="text-sm text-[var(--muted)]">
                          Lv.{bird.level} / {birdSpecies.rarity}
                        </p>
                      </div>
                      {bird.selected ? (
                        <span className="border border-[var(--leaf)] px-2 py-1 text-xs font-bold text-[var(--leaf-dark)]">
                          選択中
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">{bird.specialty}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    className="h-10 border border-[var(--leaf)] bg-[var(--leaf)] text-sm font-bold text-white"
                    disabled={bird.selected || busy === `select-${bird.id}`}
                    type="button"
                    onClick={() => select(bird.id)}
                  >
                    選択
                  </button>
                  <button
                    className="h-10 border border-[var(--line)] text-sm font-bold"
                    type="button"
                    onClick={() => {
                      setEditingId(bird.id);
                      setNickname(bird.nickname);
                    }}
                  >
                    名前変更
                  </button>
                </div>
                {editingId === bird.id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="h-10 min-w-0 flex-1 border border-[var(--line)] px-3 text-sm"
                      maxLength={16}
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                    />
                    <button
                      className="h-10 border border-[var(--leaf)] bg-[var(--leaf)] px-4 text-sm font-bold text-white"
                      type="button"
                      onClick={() => rename(bird.id)}
                    >
                      保存
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {state.species.map((entry) => {
            const owned = ownedSpeciesIds.has(entry.id);
            return (
              <article key={entry.id} className="flex gap-3 border border-[var(--line)] bg-white p-3">
                <div className="relative h-24 w-24 shrink-0 bg-[var(--background)]">
                  <AssetImage
                    alt=""
                    className={clsx("object-contain", !owned && "opacity-35 grayscale")}
                    fill
                    src={owned ? entry.asset : entry.silhouetteAsset}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-bold">{owned ? entry.name : "未発見の文鳥"}</h3>
                    <span className="shrink-0 border border-[var(--line)] px-2 py-1 text-xs font-bold">
                      {entry.rarity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {owned ? entry.description : entry.acquisitionHint}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ShopScreen({
  state,
  busy,
  resultIds,
  setResultIds,
  runMutation,
  setState,
}: {
  state: GameState;
  busy: string | null;
  resultIds: string[];
  setResultIds: (ids: string[]) => void;
  runMutation: <T>(label: string, action: () => Promise<T>) => Promise<T | null>;
  setState: (state: GameState) => void;
}) {
  async function gacha(pulls: 1 | 10) {
    const result = await runMutation(`gacha-${pulls}`, () =>
      apiPost<{ state: GameState; resultBirds: OwnedBird[] }>("/api/game/gacha", { pulls }),
    );
    if (result) {
      setState(result.state);
      setResultIds(result.resultBirds.map((bird) => bird.id));
    }
  }

  async function purchase(itemCode: string) {
    const next = await runMutation(`buy-${itemCode}`, () =>
      apiPost<GameState>("/api/game/shop/purchase", { itemCode }),
    );
    if (next) {
      setState(next);
    }
  }

  const resultBirds = state.ownedBirds.filter((bird) => resultIds.includes(bird.id));
  const inventoryCountByCode = new Map(state.inventory.map((entry) => [entry.itemCode, entry.quantity]));

  return (
    <section className="px-4 pb-4 pt-20">
      <Header title="ショップ" subtitle="ガチャとアイテム" />
      <div className="mt-4 flex h-14 items-center justify-between border border-[var(--line)] bg-white px-4">
        <span className="flex items-center gap-2 font-bold">
          <Coins className="h-5 w-5 text-[var(--sun)]" />
          ガチャコイン
        </span>
        <span className="font-mono text-xl font-bold">{state.profile.coins}</span>
      </div>
      <div className="relative mt-4 overflow-hidden border border-[var(--line)] bg-white p-4">
        <AssetImage alt="" className="object-cover opacity-25" fill src="/images/gacha/sparkle.svg" />
        <div className="relative">
          <h2 className="text-lg font-bold">文鳥ガチャ</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">10連は最後の1枠がRare以上確定です。</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className="h-12 border border-[var(--leaf)] bg-[var(--leaf)] font-bold text-white"
              disabled={busy === "gacha-1" || state.profile.coins < 250}
              type="button"
              onClick={() => gacha(1)}
            >
              {state.profile.coins >= 250 ? "1回 250" : "コイン不足"}
            </button>
            <button
              className="h-12 border border-[var(--coral)] bg-[var(--coral)] font-bold text-white"
              disabled={busy === "gacha-10" || state.profile.coins < 1200}
              type="button"
              onClick={() => gacha(10)}
            >
              {state.profile.coins >= 1200 ? "10回 1200" : "コイン不足"}
            </button>
          </div>
        </div>
      </div>
      <h2 className="mt-5 text-base font-bold">アイテム</h2>
      <div className="mt-2 grid gap-2">
        {state.items.map((item) => (
          <article key={item.code} className="flex gap-3 border border-[var(--line)] bg-white p-3">
            <div className="relative h-20 w-20 shrink-0 bg-[var(--background)]">
              <AssetImage alt="" className="object-contain" fill src={item.asset} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.description}</p>
                  <p className="mt-1 text-xs font-bold text-[var(--leaf-dark)]">
                    所持 x{inventoryCountByCode.get(item.code) ?? 0}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold">{item.priceCoin}</span>
              </div>
              <button
                className="mt-3 h-10 w-full border border-[var(--leaf)] bg-[var(--leaf)] text-sm font-bold text-white"
                disabled={busy === `buy-${item.code}` || state.profile.coins < item.priceCoin}
                type="button"
                onClick={() => purchase(item.code)}
              >
                {state.profile.coins >= item.priceCoin ? "購入" : "コイン不足"}
              </button>
            </div>
          </article>
        ))}
      </div>
      {resultBirds.length > 0 ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-[#17211c]/55 p-4">
          <div className="max-h-[82vh] w-full overflow-y-auto border border-[var(--line)] bg-white p-4">
            <h2 className="text-center text-xl font-bold">ガチャ結果</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {resultBirds.map((bird) => {
                const birdSpecies = state.species.find((entry) => entry.id === bird.speciesId)!;
                return (
                  <div key={bird.id} className="border border-[var(--line)] p-2 text-center">
                    <div className="relative mx-auto h-24 w-24">
                      <AssetImage alt="" className="object-contain" fill src={birdSpecies.asset} />
                    </div>
                    <p className="truncate text-sm font-bold">{bird.nickname}</p>
                    <p className="text-xs text-[var(--muted)]">{birdSpecies.rarity}</p>
                  </div>
                );
              })}
            </div>
            <button
              className="mt-4 h-11 w-full border border-[var(--leaf)] bg-[var(--leaf)] font-bold text-white"
              type="button"
              onClick={() => setResultIds([])}
            >
              閉じる
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BattleScreen({
  state,
  busy,
  runMutation,
  setState,
}: {
  state: GameState;
  busy: string | null;
  runMutation: <T>(label: string, action: () => Promise<T>) => Promise<T | null>;
  setState: (state: GameState) => void;
}) {
  const [activeRoom, setActiveRoom] = useState<BattleRoom | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [localTaps, setLocalTaps] = useState(0);
  const pendingTapsRef = useRef(0);
  const seqRef = useRef(0);

  async function start(mode: BattleMode) {
    const result = await runMutation(`battle-${mode}`, () =>
      apiPost<{ state: GameState; room: BattleRoom }>("/api/game/battle/room", { mode }),
    );
    if (result) {
      seqRef.current = 0;
      pendingTapsRef.current = 0;
      setLocalTaps(0);
      setState(result.state);
      setActiveRoom(result.room);
    }
  }

  const flushTaps = useCallback(async () => {
    const room = activeRoom;
    const delta = pendingTapsRef.current;
    if (!room || room.status !== "running" || delta <= 0) {
      return;
    }

    pendingTapsRef.current = 0;
    seqRef.current += 1;
    try {
      const result = await apiPost<{ state: GameState; room: BattleRoom; acceptedDelta: number }>(
        "/api/game/battle/tap",
        { roomId: room.id, delta, seq: seqRef.current },
      );
      setState(result.state);
      setActiveRoom(result.room);
    } catch {
      pendingTapsRef.current += delta;
    }
  }, [activeRoom, setState]);

  const finalize = useCallback(async () => {
    if (!activeRoom) {
      return;
    }

    await flushTaps();
    const result = await runMutation("battle-finalize", () =>
      apiPost<{ state: GameState; room: BattleRoom }>("/api/game/battle/finalize", { roomId: activeRoom.id }),
    );
    if (result) {
      setState(result.state);
      setActiveRoom(result.room);
    }
  }, [activeRoom, flushTaps, runMutation, setState]);

  useEffect(() => {
    if (!activeRoom || activeRoom.status !== "running") {
      return;
    }

    const tick = () => {
      const next = Math.max(0, new Date(activeRoom.finishesAt).getTime() - Date.now());
      setRemainingMs(next);
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [activeRoom]);

  useEffect(() => {
    if (activeRoom?.status === "running" && remainingMs === 0) {
      const timer = window.setTimeout(() => {
        void finalize();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [activeRoom?.status, finalize, remainingMs]);

  useEffect(() => {
    if (!activeRoom || activeRoom.status !== "running") {
      return;
    }

    const timer = window.setInterval(() => {
      void flushTaps();
    }, 200);
    return () => window.clearInterval(timer);
  }, [activeRoom, flushTaps]);

  const activeSpecies = state.species.find((entry) => entry.id === state.selectedBird.speciesId)!;

  return (
    <section className="px-4 pb-4 pt-20">
      <Header title="小松菜高速食べバトル" subtitle="報酬ありの判定はサーバーで確定" />
      <div className="relative mt-4 h-56 overflow-hidden border border-[var(--line)] bg-white">
        <AssetImage alt="" className="object-cover" fill priority src="/images/battle/battle-table.svg" />
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
          <div className="relative h-28 w-28">
            <AssetImage alt="" className="object-contain drop-shadow-lg" fill src={activeSpecies.asset} />
          </div>
          <div className="border border-white/55 bg-white/86 px-3 py-2 text-right backdrop-blur">
            <p className="text-xs font-bold text-[var(--muted)]">SERVER SCORE</p>
            <p className="font-mono text-2xl font-bold">{activeRoom?.score ?? 0}</p>
          </div>
        </div>
      </div>
      {activeRoom && activeRoom.status !== "running" ? <BattleResultPanel room={activeRoom} /> : null}
      {!activeRoom || activeRoom.status !== "running" ? (
        <div className="mt-4 grid gap-2">
          <button
            className="h-12 border border-[var(--leaf)] bg-[var(--leaf)] font-bold text-white"
            disabled={busy === "battle-online"}
            type="button"
            onClick={() => start("online")}
          >
            オンライン待機を開始
          </button>
          <button
            className="h-12 border border-[var(--line)] bg-white font-bold"
            disabled={busy === "battle-offline"}
            type="button"
            onClick={() => start("offline")}
          >
            オフライン練習
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            <BattleMetric label="残り" value={`${Math.ceil(remainingMs / 1_000)}s`} />
            <BattleMetric label="入力" value={String(localTaps)} />
            <BattleMetric label="上限" value={`${activeRoom.maxTapsPerSec}/s`} />
          </div>
          <button
            className="mt-4 grid h-36 w-full place-items-center border border-[var(--coral)] bg-[var(--coral)] text-2xl font-black text-white active:scale-[0.99]"
            type="button"
            onClick={() => {
              pendingTapsRef.current += 1;
              setLocalTaps((value) => value + 1);
            }}
          >
            <span className="flex items-center gap-3">
              <Zap className="h-8 w-8" />
              食べる
            </span>
          </button>
          <button
            className="mt-2 h-11 w-full border border-[var(--line)] bg-white font-bold"
            type="button"
            onClick={finalize}
          >
            結果確定
          </button>
        </div>
      )}
      {activeRoom?.status === "disqualified" ? (
        <p className="mt-4 border border-[var(--danger)] bg-white p-3 text-sm font-bold text-[var(--danger)]">
          不可能な入力が続いたため失格になりました。
        </p>
      ) : null}
      <h2 className="mt-5 text-base font-bold">不正検知ログ</h2>
      <div className="mt-2 grid gap-2">
        {state.battleLogs.length > 0 ? (
          state.battleLogs.map((log) => (
            <p key={log.id} className="border border-[var(--line)] bg-white p-3 text-sm text-[var(--muted)]">
              <span className="font-mono text-xs">{log.kind}</span> / {log.detail}
            </p>
          ))
        ) : (
          <p className="border border-[var(--line)] bg-white p-3 text-sm text-[var(--muted)]">
            まだ異常入力はありません。
          </p>
        )}
      </div>
    </section>
  );
}

function BattleResultPanel({ room }: { room: BattleRoom }) {
  const resultLabel =
    room.result === "win"
      ? "勝利"
      : room.result === "lose"
        ? "敗北"
        : room.result === "draw"
          ? "引き分け"
          : room.result === "practice"
            ? "練習終了"
            : room.result === "disqualified"
              ? "失格"
              : "集計中";

  return (
    <div className="mt-4 border border-[var(--line)] bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[var(--muted)]">RESULT</p>
          <h2 className="text-xl font-black">{resultLabel}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-[var(--muted)]">報酬</p>
          <p className="font-mono text-lg font-black">+{room.rewardCoin}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <BattleMetric label="自分" value={String(room.score)} />
        <BattleMetric label={room.opponentName} value={String(room.opponentScore)} />
      </div>
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header>
      <p className="text-sm font-bold text-[var(--leaf)]">{subtitle}</p>
      <h1 className="text-2xl font-black leading-tight">{title}</h1>
    </header>
  );
}

function Segment({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={clsx("h-10 text-sm font-bold transition", active ? "bg-[var(--leaf)] text-white" : "text-[var(--muted)]")}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function CareButton({
  busy,
  icon,
  label,
  onClick,
}: {
  busy: boolean;
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex h-14 items-center justify-center gap-2 border border-[var(--line)] bg-white font-bold transition hover:border-[var(--leaf)]"
      disabled={busy}
      type="button"
      onClick={onClick}
    >
      {icon}
      {busy ? "処理中" : label}
    </button>
  );
}

function ConditionMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[var(--line)] bg-white p-2 text-center">
      <p className="truncate text-[11px] font-bold text-[var(--muted)]">{label}</p>
      <p className="font-mono text-lg font-black">{value}</p>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[var(--line)] bg-white p-3">
      <div className="mb-2 flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="h-2 bg-[#e2ece5]">
        <div className="h-full bg-[var(--leaf)]" style={{ width: `${Math.max(5, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function BattleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] bg-white p-3 text-center">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="truncate font-mono text-lg font-black">{value}</p>
    </div>
  );
}

function AssetImage({
  alt,
  className,
  fill,
  priority,
  src,
}: {
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  src: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-[#e6efe9] text-xs font-bold text-[var(--muted)]">
        image
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        alt={alt}
        className={className}
        fill
        priority={priority}
        sizes="(max-width: 520px) 100vw, 480px"
        src={src}
        unoptimized
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={240}
      priority={priority}
      src={src}
      unoptimized
      width={240}
      onError={() => setFailed(true)}
    />
  );
}

async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await readApiResult<T>(response);
  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? `通信に失敗しました。(${response.status})` : payload.message);
  }

  return payload.data;
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readApiResult<T>(response);
  if (!response.ok || !payload.ok) {
    throw new Error(payload.ok ? `通信に失敗しました。(${response.status})` : payload.message);
  }

  return payload.data;
}

async function readApiResult<T>(response: Response): Promise<ApiResult<T>> {
  try {
    return (await response.json()) as ApiResult<T>;
  } catch {
    return { ok: false, message: `API 応答を読み取れませんでした。(${response.status})` };
  }
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "処理に失敗しました。";
}
