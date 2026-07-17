# 文鳥育成シミュレーター

スマホで遊べる文鳥育成ゲームです。端末内GGUFチャット、育成クエスト、ランキング、プレイヤーID、フレンド、仕送り、Googleログイン、クラウド保存を一つのUIに統合しています。

## ローカル起動

```powershell
copy .env.example .env.local
npm.cmd ci
npm.cmd run dev
```

開発URLは `http://localhost:3000` です。PowerShellの実行ポリシーで `npm.ps1` が止まる場合は `npm.cmd` を使います。

## 主な画面と機能

- `/`: お世話、コンディション、持ちもの、表情付き端末内AI
- `/encyclopedia`: 所持文鳥、図鑑、名前変更、選択切替
- `/shop`: ガチャ、10連Rare以上保証、アイテム購入
- `/battle`: オンライン／練習バトル、サーバー側タップ検証、報酬
- `/social`: 育成クエスト、絆ランク、ランキング、フレンドID、文鳥訪問、仕送り受取
- `/login`: Google Identity Services、LINE／Apple（任意）、デモ開始

## 端末内AI

`E:\qwen2.5-1.5b-instruct-q4_k_m.gguf` は約1.04GBです。PCのドライブをスマホのブラウザから直接読むことはできないため、最初にGGUFをスマホへコピーしてください。

1. ホーム右下の「AI読込」を押す
2. 利用規約と端末負荷の注意事項に同意
3. スマホ内のGGUFを選択
4. 保存後、「キャッシュから起動」を押す

モデルはサーバーへアップロードされず、ブラウザのOPFSへ保存されます。次回は同じブラウザから再選択せず起動できます。WebGPU対応端末ではGPUを使い、それ以外は省メモリWASMで動きます。モデルの初回保存には約1.1GB以上の空き容量が必要です。

## Googleログイン

提示されたWeb Client IDを既定値として実装済みです。

```text
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1027705662725-bn7tbc4rrflvv5sk0redv6043nnmajld.apps.googleusercontent.com
```

Google Cloud Consoleの「承認済みのJavaScript生成元」へ次を登録してください。

```text
http://localhost:3000
https://buntyousodateri.vercel.app
```

Googleから受け取ったIDトークンはサーバー側で署名とaudienceを検証し、HttpOnly Cookieに保存します。この経路ではクライアントシークレットは不要です。LINE／Appleまたは従来のAuth.js Google OAuthを併用する場合だけ、各 `AUTH_*` 変数と `AUTH_SECRET` を設定します。

## 新しいクラウド保存とソーシャル機能

旧ブラウザ保存をゲーム進行には使用しません。Supabase設定時は、全ゲーム状態を `game_saves` にサーバー保存し、フレンド・ランキング・仕送りもサーバーAPI経由で更新します。

1. Supabaseプロジェクトを作成
2. SQL Editorで `supabase/migrations/001_initial_schema.sql` を実行
3. 続けて `supabase/migrations/002_cloud_social.sql` を実行
4. 次の環境変数を設定

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase未設定時も全機能を確認できるデモ用メモリストアへフォールバックします。ただしVercel上のメモリは永続保証されないため、本運用では必ずSupabaseを設定してください。Service Role Keyはクライアントへ公開しないでください。

## そのほかの環境変数

```text
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

AUTH_SECRET=
AUTH_LINE_ID=
AUTH_LINE_SECRET=

NEXT_PUBLIC_ENABLE_APPLE=false
AUTH_APPLE_ID=
AUTH_APPLE_SECRET=

# Googleログインを必須にする本番では false
ALLOW_DEMO_AUTH=false
```

Upstash未設定時はローカルメモリのレート制限へフォールバックします。本運用では複数インスタンスで共有できるUpstashを推奨します。

## 検証

```powershell
npm.cmd run lint
npm.cmd run build
```

APIはzodで入力検証し、コイン、ガチャ、仕送り在庫、バトル勝敗をクライアント値だけで更新しません。
