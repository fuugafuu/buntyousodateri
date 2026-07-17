# Mofumori

猫・きつね・ペンギン・鳥たちと暮らせる、スマホ対応のどうぶつ育成ゲームです。14種類のミニゲーム、ミニミッション、端末内GGUF AI、フレンド、ランキング、仕送りに対応しています。

## ローカル起動

```powershell
python -m http.server 3101 --bind 127.0.0.1
```

`http://127.0.0.1:3101` を開きます。ローカルではGoogleログインとクラウド同期を使わず、端末モードで動作します。

## 端末内AI

1. 「端末AI」→「モデル設定」を開く
2. 利用条件を確認して同意する
3. `qwen2.5-1.5b-instruct-q4_k_m.gguf` を選択する

GGUFはサーバーへ送信されず、ブラウザのOPFSへ保存されます。対応端末ではWebGPU、それ以外ではWASMを使います。初回は約1.1GBの空き容量と読み込み時間が必要です。

## 本番環境

必要な環境変数は `.env.example` を参照してください。

- `GOOGLE_CLIENT_ID`: Google Identity ServicesのウェブクライアントID
- `SUPABASE_URL`: SupabaseプロジェクトURL
- `SUPABASE_SERVICE_ROLE_KEY`: サーバー専用サービスロールキー（ブラウザへ公開しない）
- `APP_ORIGIN`: 任意。例 `https://buntyousodateri.vercel.app`

Supabase SQL Editorで `supabase/mofumori_v4.sql` を実行すると、クラウドセーブ、フレンド、ランキング、仕送りのテーブルとトランザクション関数が作成されます。Google Cloud側の承認済みJavaScript生成元には `https://buntyousodateri.vercel.app` を追加します。

## 保存方式

ゲーム進行はIndexedDB `mofumori-v4` に保存します。旧Cookie/localStorageセーブが見つかった場合だけ一度読み込み、新形式へ移行後に旧データを削除します。GoogleログインとSupabase設定がある場合はクラウドにも同期します。

## 検証

```powershell
npm install
npm test
npm run test:ui
```

実GGUFを使う検証はモデルを `E:\qwen2.5-1.5b-instruct-q4_k_m.gguf` に置き、ローカルサーバー起動後に `npm run test:ai` を実行します。
