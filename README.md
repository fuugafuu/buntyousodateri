# 文鳥育成シュミレーター

Next.js App Router + TypeScript で作った、文鳥育成と「小松菜高速食べバトル」のMVPです。ローカルでは外部サービス未設定でもデモモードで動きます。本番公開時は Auth.js、Supabase、Upstash、Cloudflare Turnstile を接続する想定です。

## セットアップ

```powershell
cd C:\Users\fuuga\OneDrive\デスクトップ\豆苗早食いバトル\buncho-game
copy .env.example .env.local
$env:NODE_OPTIONS='--use-system-ca'
npm.cmd run dev
```

開発URLは `http://localhost:3000` です。PowerShellで `npm.ps1` が実行ポリシーに止められる場合は `npm.cmd` を使ってください。

## 実装済み

- `/login`: Google / LINE / Apple feature flag / デモ開始
- `/`: ホーム、お世話、ステータス、持ちもの
- `/encyclopedia`: 所持文鳥、図鑑、名前変更、選択中切替
- `/shop`: ガチャ、10連Rare以上保証、アイテム購入
- `/battle`: オンライン/オフラインのバトル開始、サーバー側タップ上限、勝敗/報酬確定、異常入力ログ
- `supabase/migrations/001_initial_schema.sql`: テーブル、RLS、初期データ、主要RPC
- APIは zod で入力検証し、コイン・ガチャ・バトル判定はクライアント値を信用しません

## 外部サービス設定

### Auth.js

`.env.local` に以下を設定します。

```text
AUTH_SECRET=
NEXTAUTH_URL=https://your-domain.example
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_LINE_ID=
AUTH_LINE_SECRET=
```

Google Cloud Console で OAuth クライアントを作り、承認済みリダイレクトURIに以下を追加します。

```text
http://localhost:3000/api/auth/callback/google
https://your-domain.example/api/auth/callback/google
```

LINE Developers では LINE Login channel を作り、コールバックURLに以下を追加します。

```text
http://localhost:3000/api/auth/callback/line
https://your-domain.example/api/auth/callback/line
```

Apple は `NEXT_PUBLIC_ENABLE_APPLE=true` と `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` が揃った場合だけ表示されます。

### Supabase

1. Supabase プロジェクトを作成
2. SQL Editor で `supabase/migrations/001_initial_schema.sql` を実行
3. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` を設定

Realtime はオンライン待機室・Presence・開始通知に拡張するための接続先です。現MVPではローカルメモリのバトルルームで動くようにしてあります。

### Upstash

Upstash Redis を作成し、以下を設定します。

```text
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

未設定時はローカル開発用のメモリレート制限にフォールバックします。本番では必ず Upstash を設定してください。

## デモモード

`AUTH_SECRET` と外部ログインプロバイダーが未設定の場合は、自動で `demo-user` として起動します。認証を必須にする本番環境では、`ALLOW_DEMO_AUTH=false` を設定したうえで Auth.js の環境変数を揃えてください。

### Cloudflare Turnstile

`.env.local` に以下を設定します。

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

ログイン画面とオンライン対戦参加APIの手前に差し込める構成にしてあります。

## 不正対策

- クライアントの `coin` 増加を受け取るAPIはありません
- ガチャ消費と排出は `/api/game/gacha` でサーバー側処理
- バトルは開始時に選択文鳥のステータスから `maxTapsPerSec` をスナップショット化
- `/api/game/battle/tap` は `delta` と `seq` を検証し、上限超過を切り捨てて `battleLogs` に記録
- 異常パケットが続くと `disqualified` になります

## 画像差し替え

今は `public/images/**` に仮SVGを置いています。最終素材は同じパス名で差し替えればUI側の変更は不要です。

必要な画像リストは実装完了時の最終報告にまとめています。

## Vercel デプロイ前チェック

- `npm.cmd run build` が通る
- `AUTH_SECRET` と `NEXTAUTH_URL` を本番値にする
- Google / LINE の本番コールバックURLを登録する
- Supabase SQL を実行し、RLSが有効なことを確認する
- Upstash Redis を設定する
- Turnstile の本番 site key / secret key を設定する
- Vercel Hobby は個人・非商用向けなので、収益化や本格運営時は Pro を検討する
