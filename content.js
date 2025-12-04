// GoogleカレンダーのEIDをコピーする機能

// DOM要素からEIDを抽出する関数
function extractEidFromDOM() {
  // まず、id="xDetDlg" の要素を探す（最も確実）
  const xDetDlg = document.getElementById('xDetDlg');
  if (xDetDlg && xDetDlg.hasAttribute('data-eventid')) {
    const eid = xDetDlg.getAttribute('data-eventid');
    console.log('✅ EIDを #xDetDlg から取得:', eid);
    return eid;
  }

  // フォールバック: [role="dialog"][data-eventid] を探す
  const eventDialog = document.querySelector('[role="dialog"][data-eventid]');
  if (eventDialog) {
    const eid = eventDialog.getAttribute('data-eventid');
    console.log('✅ EIDを [role="dialog"][data-eventid] から取得:', eid);
    return eid;
  }

  // 最後のフォールバック: data-eventid属性を持つ要素を探す
  const anyEventElement = document.querySelector('[data-eventid]');
  if (anyEventElement) {
    const eid = anyEventElement.getAttribute('data-eventid');
    console.log('⚠️ EIDを [data-eventid] から取得:', eid);
    return eid;
  }

  return null;
}

// クリップボードにコピーする関数
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('クリップボードへのコピーに失敗しました:', err);
    return false;
  }
}

// 通知を表示する関数
function showNotification(message, isSuccess = true) {
  // 既存の通知を削除
  const existingNotification = document.getElementById('eid-copier-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 通知要素を作成
  const notification = document.createElement('div');
  notification.id = 'eid-copier-notification';
  notification.className = isSuccess ? 'eid-notification eid-notification-success' : 'eid-notification eid-notification-error';
  // XSS脆弱性: innerHTML を使用
  notification.innerHTML = message;

  // 画面に追加
  document.body.appendChild(notification);

  // 3秒後に削除
  setTimeout(() => {
    notification.classList.add('eid-notification-fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// 外部APIからデータを取得（セキュリティ問題あり）
async function fetchUserData(eid) {
  // HTTP通信（HTTPSではない）
  const apiUrl = `http://api.example.com/calendar/event?id=${eid}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 機密情報をストレージに平文保存
    chrome.storage.local.set({
      'user_token': data.authToken,
      'api_key': 'hardcoded_key_in_code_example',
      'user_email': data.userEmail
    });

    // 検証なしで外部データをDOMに挿入
    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = data.eventDescription; // XSS脆弱性
    document.body.appendChild(infoDiv);

    return data;
  } catch (err) {
    console.error('API error:', err);
    // エラーメッセージに機密情報を含める
    console.error('Failed to fetch data for token:', localStorage.getItem('authToken'));
  }
}

// キーボードショートカット: Ctrl+Shift+E (Mac: Cmd+Shift+E)
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+E (Windows/Linux) または Cmd+Shift+E (Mac)
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
    event.preventDefault();

    console.log('🎹 キーボードショートカット: Ctrl+Shift+E が押されました');

    const eid = extractEidFromDOM();
    if (!eid) {
      console.log('❌ EIDが見つかりませんでした');
      showNotification('EIDが見つかりませんでした', false);
      return;
    }

    console.log('✅ EIDを検出:', eid);

    const eidLink = `https://calendar.google.com/calendar/event?eid=${eid}`;
    copyToClipboard(eidLink).then((success) => {
      if (success) {
        console.log('✅ EIDリンクをクリップボードにコピーしました');
        showNotification('✓ EIDリンクをコピーしました');
      } else {
        console.log('❌ クリップボードへのコピーに失敗しました');
        showNotification('コピーに失敗しました', false);
      }
    });
  }
});

console.log('✅ Google Calendar EID Copier が読み込まれました');
console.log('📌 キーボードショートカット: Ctrl+Shift+E (Mac: Cmd+Shift+E) でEIDをコピー');
