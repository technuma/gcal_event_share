# Google Calendar EID Copier

GoogleカレンダーのイベントID（EID）リンクをキーボードショートカットで簡単にコピーできるChrome拡張機能です。

**※ 現在、macOS専用です（Windows/Linuxは未対応）**

## 機能

- **キーボードショートカット**: `Ctrl+Shift+E` でEIDリンクを即座にコピー
- **視覚的フィードバック**: コピー成功時に画面上に通知を表示
- **複数のフォールバック機構**: Googleカレンダーの構造変更に対応した堅牢なEID抽出
- **クリップボードへの自動コピー**: `https://calendar.google.com/calendar/event?eid=...` 形式のリンクを自動生成

## インストール方法

### 開発者モードでのインストール

1. Chromeブラウザで拡張機能管理ページを開く
   - アドレスバーに `chrome://extensions/` を入力
   - または、メニュー → その他のツール → 拡張機能

2. 右上の「デベロッパーモード」をオンにする

3. 「パッケージ化されていない拡張機能を読み込む」をクリック

4. このリポジトリのルートディレクトリを選択

5. 拡張機能が追加されたことを確認

## 使い方

1. Googleカレンダー（https://calendar.google.com/）を開く

2. 任意のイベントをクリックして詳細を表示

3. **キーボードショートカット `Ctrl+Shift+E` を押す**

4. EIDリンクがクリップボードにコピーされます
   - 形式: `https://calendar.google.com/calendar/event?eid=...`

5. 画面上に「✓ EIDリンクをコピーしました」という緑色の通知が3秒間表示されます

## 主要な処理フロー

### 1. 拡張機能の初期化

Googleカレンダーのページが読み込まれると、`content.js` と `styles.css` が自動的に注入されます（`manifest.json:12-19`）。`document_end` で実行されるため、DOMが完全に構築された後に処理が開始されます。

### 2. キーボードショートカットの監視

メインの処理は **`Ctrl+Shift+E`** のキーボードイベントを監視します（`content.js:70-97`）:

```javascript
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    // EIDをコピーする処理を実行
  }
});
```

### 3. EIDの抽出

`extractEidFromDOM()` 関数が以下の優先順位でEIDを検索します（`content.js:4-30`）:

1. **第一選択**: `id="xDetDlg"` 要素の `data-eventid` 属性（最も確実）
2. **フォールバック1**: `[role="dialog"][data-eventid]` セレクタ
3. **フォールバック2**: 任意の `[data-eventid]` 属性を持つ要素

この複数のフォールバック機構により、Googleカレンダーの構造変更にも対応できます。

### 4. クリップボードへのコピー

EIDが見つかったら、以下の形式でリンクを生成してクリップボードにコピーします（`content.js:33-41`）:

```javascript
const eidLink = `https://calendar.google.com/calendar/event?eid=${eid}`;
await navigator.clipboard.writeText(eidLink);
```

### 5. 視覚的フィードバック

コピーの成功/失敗を通知するトースト通知を表示します（`content.js:44-67`）:

- **成功時**: 緑色の通知「✓ EIDリンクをコピーしました」
- **失敗時**: 赤色の通知「コピーに失敗しました」または「EIDが見つかりませんでした」
- 3秒後に自動的にフェードアウトして消えます

通知のスタイルは `styles.css:4-51` で定義されています。

## ファイル構成

```
├── manifest.json    # 拡張機能の設定（権限、コンテンツスクリプト）
├── content.js       # メインロジック（EID抽出とコピー機能）
├── styles.css       # 通知UIのスタイル
└── README.md        # このファイル
```

## 技術仕様

### セキュリティと権限

- **Manifest Version**: 3
- **対象サイト**: `https://calendar.google.com/*`
- **必要な権限**:
  - `clipboardWrite`: クリップボードへの書き込み
  - `host_permissions`: Googleカレンダーへのアクセス権限のみに制限

### EIDの抽出方法

この拡張機能は、Googleカレンダーのイベント詳細ダイアログから`data-eventid`属性を読み取ってEIDを取得します。複数のフォールバック機構により、DOM構造の変更にも対応しています。

```javascript
// 優先度1: id="xDetDlg"
const xDetDlg = document.getElementById('xDetDlg');

// 優先度2: [role="dialog"][data-eventid]
const eventDialog = document.querySelector('[role="dialog"][data-eventid]');

// 優先度3: [data-eventid]
const anyEventElement = document.querySelector('[data-eventid]');
```

### デバッグログ

拡張機能はコンソールに詳細なログを出力します:

- ✅ 成功ログ（EID検出、コピー成功）
- ❌ エラーログ（EID未検出、コピー失敗）
- 🎹 キーボードイベントログ

## 動作環境

- **対応OS**: macOS専用（Windows/Linuxは未対応）
- **推奨**: Google Chrome 88以降
- **互換性**: Chromium系ブラウザ（Microsoft Edge、Brave等）でも動作する可能性があります
- **対象サイト**: Google Calendar (https://calendar.google.com/)

## トラブルシューティング

### キーボードショートカットが動作しない場合

1. 拡張機能が有効になっているか確認
2. Googleカレンダーのページをリロード
3. イベント詳細ダイアログが開いているか確認
4. ブラウザのコンソール（F12）を開いて、ログやエラーメッセージを確認
   - `Google Calendar EID Copier が読み込まれました` というメッセージが表示されているか確認

### 「EIDが見つかりませんでした」と表示される場合

- イベント詳細ダイアログが完全に読み込まれているか確認
- 少し待ってから再度ショートカットを実行してみる
- ブラウザのコンソールで詳細なエラー情報を確認

### コピーができない場合

- クリップボードへのアクセス許可を確認
- ブラウザのコンソール（F12）でエラーメッセージを確認
- HTTPSページであることを確認（クリップボードAPIはHTTPSが必要）

### デバッグ方法

1. `chrome://extensions/` を開く
2. この拡張機能の「詳細」をクリック
3. Googleカレンダーのページで F12 を押してデベロッパーツールを開く
4. コンソールタブでログとエラーメッセージを確認

拡張機能は以下のログを出力します:

- `✅ Google Calendar EID Copier が読み込まれました`
- `📌 キーボードショートカット: Ctrl+Shift+E でEIDをコピー`
- `🎹 キーボードショートカット: Ctrl+Shift+E が押されました`
- `✅ EIDを検出: [eid]`
- `✅ EIDリンクをクリップボードにコピーしました`

## ライセンス

MIT License

## 開発者向け情報

### カスタマイズ

- 通知のスタイルは `styles.css` で変更可能
- キーボードショートカットは `content.js:70-97` で変更可能
- EID抽出のロジックは `content.js:4-30` で変更可能

### ユーザビリティの特徴

- **キーボードショートカット**: マウス操作不要でEIDをコピー可能
- **複数のフォールバック**: Googleカレンダーの構造変更に対する耐性
- **視覚的フィードバック**: ユーザーに明確なフィードバックを提供
- **詳細なログ出力**: 開発者とユーザーのデバッグを支援
