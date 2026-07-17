Original prompt: E:\qwen2.5-1.5b-instruct-q4_k_m.gguf を利用規約同意後に端末内で読み込み、スマホでAIを動かす。AIが要求・表情変更・自発会話でき、モデルをキャッシュする。育成の楽しさ、ランキング、IDフレンド、仕送り、友達の文鳥閲覧、Googleログインを追加し、buntyousodateri.vercel.app を復旧、旧保存システムを廃止して使い心地を改善する。

## 設計判断

- 現行 `main` の Next.js / Auth.js / Supabase 版を基点に `codex/ai-social-relaunch` で作業する。
- GGUFはサーバーへアップロードせず、wllamaで端末内推論する。初回選択後はOPFSへ保存する。
- 1.04GBのモデルはwllamaの2GB上限内。スマホへモデルファイルをコピーして初回選択する必要がある。
- Googleは提示されたWeb Client IDをGoogle Identity Servicesで使用し、ID tokenをサーバー側で検証する。
- ランキング・フレンド・仕送りはサーバーAPIを必須にし、Supabase未設定時だけデモ用メモリストアへフォールバックする。
- Vercel障害は `DEPLOYMENT_NOT_FOUND`。プロジェクトは存在するが `live: false` で本番エイリアスが外れている。

## TODO

- [x] 端末内AI、利用規約、OPFSキャッシュ、自発会話・表情・要求
- [x] 育成ストリーク、デイリー目標、ランキング
- [x] プレイヤーID、フレンド、文鳥閲覧、仕送り
- [x] Google Identity Services + サーバー側ID token検証
- [x] Supabase移行SQLとクラウド保存
- [x] build / Playwright / API / モバイル検証
- [ ] GitHub公開とVercel本番復旧

## 検証メモ

- `E:\qwen2.5-1.5b-instruct-q4_k_m.gguf`: 1,117,320,736 bytes。
- wllama 3.5.1、google-auth-library 10.3.0を追加。
- Vercel project: `prj_62umaMIvmPTKWmxeWGXDP5E6aM6w` / team `team_Xq8oZ9O0lPbcm8NoGUhIeokU`。
- `npm.cmd run build`: Next.js 16.2.9で成功（端末AI、social API、Google APIを含む）。
- API実動: フレンド追加、仕送り、在庫2→1、未知ID 404を確認。
- Playwright 390x844: socialモーダル、5タブナビ、AI利用規約ダイアログ、console error 0件。
- 実GGUF: OPFS保存→WebGPU起動→Qwen応答生成まで成功（1.04GBを実際に使用）。
- `npm.cmd run lint` / `npm.cmd run build`: 最終状態で両方成功。
