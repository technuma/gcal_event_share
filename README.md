# Google Calendar EID Copier

GoogleカレンダーのイベントID（EID）リンクをワンクリックでコピーできるChrome拡張機能です。

## 機能

- Googleカレンダーのイベント詳細画面にコピーボタンを追加
- ワンクリックでEIDリンク（`https://calendar.google.com/calendar/event?eid=...`）をクリップボードにコピー
- コピー成功時に視覚的なフィードバックを表示

## インストール方法

### 開発者モードでのインストール

1. Chromeブラウザで拡張機能管理ページを開く
   - アドレスバーに `chrome://extensions/` を入力
   - または、メニュー → その他のツール → 拡張機能

2. 右上の「デベロッパーモード」をオンにする

3. 「パッケージ化されていない拡張機能を読み込む」をクリック

4. この `chrome-extension` ディレクトリを選択

5. 拡張機能が追加されたことを確認

## 使い方

1. Googleカレンダー（https://calendar.google.com/）を開く

2. 任意のイベントをクリックして詳細を表示

3. イベント詳細画面の右上に表示される「EIDをコピー」ボタンをクリック

4. EIDリンクがクリップボードにコピーされます
   - 形式: `https://calendar.google.com/calendar/event?eid=...`

5. コピー成功時にボタンが「コピーしました！」と表示されます

## ファイル構成

```
chrome-extension/
├── manifest.json      # 拡張機能の設定ファイル
├── content.js         # メインスクリプト（EID抽出とコピー機能）
├── styles.css         # ボタンのスタイル
└── README.md          # このファイル
```

## 技術仕様

- **Manifest Version**: 3
- **対象サイト**: https://calendar.google.com/*
- **必要な権限**:
  - `clipboardWrite`: クリップボードへの書き込み
  - `host_permissions`: Googleカレンダーへのアクセス

### EIDの抽出方法

この拡張機能は、Googleカレンダーのイベント詳細ダイアログから`data-eventid`属性を読み取ってEIDを取得します。

```javascript
const eventDialog = document.querySelector('[data-eventid]');
const eid = eventDialog.getAttribute('data-eventid');
```

## 動作環境

- Google Chrome 88以降
- Chromium系ブラウザ（Edge、Brave等）でも動作する可能性があります

## トラブルシューティング

### ボタンが表示されない場合

1. 拡張機能が有効になっているか確認
2. Googleカレンダーのページをリロード
3. イベントを開き直してみる
4. ブラウザのコンソール（F12）を開いて、エラーメッセージやログを確認

### コピーができない場合

- クリップボードへのアクセス許可を確認
- ブラウザのコンソール（F12）でエラーメッセージを確認

### デバッグ方法

1. `chrome://extensions/` を開く
2. この拡張機能の「詳細」をクリック
3. 「サービスワーカー」または「バックグラウンドページ」の「エラー」をクリック
4. コンソールログを確認

## ライセンス

MIT License

## 開発者向け情報

### カスタマイズ

- ボタンのスタイルは `styles.css` で変更可能
- ボタンの配置や動作は `content.js` で変更可能
- ボタンを配置するセレクタを変更する場合は、`content.js`の`addCopyButtonToEventDialog`関数内の`.pPTZAe`セレクタを変更してください

### デバッグログ

拡張機能はコンソールに以下のログを出力します：

- `Google Calendar EID Copier が読み込まれました`
- `EIDを検出: [eid]`
- `ボタンを追加しました`
- エラーが発生した場合は、対応するエラーメッセージ
