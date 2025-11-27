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

// コピーボタンを作成する関数
function createCopyButton(eid) {
  const button = document.createElement('button');
  button.id = 'eid-copy-button';
  button.className = 'eid-copy-btn';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z"/>
      <path d="M2 6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1v1H2z"/>
    </svg>
    <span>EIDをコピー</span>
  `;

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const eidLink = `https://calendar.google.com/calendar/event?eid=${eid}`;
    const success = await copyToClipboard(eidLink);

    if (success) {
      // コピー成功のフィードバック
      const originalContent = button.innerHTML;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        <span>コピーしました！</span>
      `;
      button.classList.add('copied');

      setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('copied');
      }, 2000);
    } else {
      // エラーのフィードバック
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
        </svg>
        <span>コピー失敗</span>
      `;

      setTimeout(() => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z"/>
            <path d="M2 6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1v1H2z"/>
          </svg>
          <span>EIDをコピー</span>
        `;
      }, 2000);
    }
  });

  return button;
}

// イベント詳細ダイアログにボタンを追加する関数
function addCopyButtonToEventDialog() {
  console.log('=== addCopyButtonToEventDialog 開始 ===');

  // 既存のボタンを削除
  const existingButton = document.getElementById('eid-copy-button');
  if (existingButton) {
    console.log('既存のボタンを削除');
    existingButton.remove();
  }

  // 編集画面には表示しない（URLにeventeditが含まれている場合）
  if (window.location.href.includes('eventedit')) {
    console.log('編集画面のため、ボタンを表示しません');
    return;
  }

  const eid = extractEidFromDOM();
  if (!eid) {
    console.log('❌ EIDが見つかりませんでした');
    return;
  }

  console.log('✅ EIDを検出:', eid);

  // イベント詳細ポップアップ（読み取り専用）のダイアログを探す
  const dialog = document.querySelector('[role="dialog"][data-eventid]');
  console.log('dialog:', dialog);

  if (!dialog) {
    console.log('❌ イベント詳細ダイアログが見つかりませんでした');
    // 代替方法: data-eventid属性を持つ要素を探す
    const altDialog = document.querySelector('[data-eventid]');
    console.log('代替ダイアログ:', altDialog);
    return;
  }

  console.log('✅ ダイアログを検出');

  // 複数のアプローチを試す
  // アプローチ1: .wv9rPe → .pPTZAe の前に挿入
  const headerArea = dialog.querySelector('.wv9rPe');
  console.log('headerArea (.wv9rPe):', headerArea);

  if (headerArea) {
    const toolbar = headerArea.querySelector('.pPTZAe');
    console.log('toolbar (.pPTZAe):', toolbar);

    if (toolbar) {
      const button = createCopyButton(eid);
      headerArea.insertBefore(button, toolbar);
      console.log('✅ ボタンを追加しました（.pPTZAeの前）');
      return;
    }
  }

  // アプローチ2: .pPTZAe の最初の子要素として挿入
  const toolbar2 = dialog.querySelector('.pPTZAe');
  console.log('toolbar2 (.pPTZAe 直接検索):', toolbar2);

  if (toolbar2) {
    const button = createCopyButton(eid);
    toolbar2.insertBefore(button, toolbar2.firstChild);
    console.log('✅ ボタンを追加しました（.pPTZAeの最初）');
    return;
  }

  // アプローチ3: .Tnsqdc クラスを探す
  const container = dialog.querySelector('.Tnsqdc');
  console.log('container (.Tnsqdc):', container);

  if (container) {
    const button = createCopyButton(eid);
    const firstChild = container.querySelector('.i5a7ie');
    if (firstChild) {
      firstChild.appendChild(button);
      console.log('✅ ボタンを追加しました（.i5a7ieに追加）');
      return;
    }
  }

  console.log('❌ ボタンを追加できませんでした');
}

// 手動実行用にグローバルスコープに公開
window.gcalEidCopierAddButton = addCopyButtonToEventDialog;

// MutationObserverでDOM変更を監視
let observerCallCount = 0;
const observer = new MutationObserver((mutations) => {
  observerCallCount++;

  // 最初の10回は常にログ出力
  if (observerCallCount <= 10) {
    console.log(`🔍 MutationObserver: ${observerCallCount}回目の呼び出し`);
  }

  // 100回ごとにログ出力（スパムを避けるため）
  if (observerCallCount % 100 === 0) {
    console.log(`MutationObserver: ${observerCallCount}回呼ばれました`);
  }

  // data-eventid属性を持つダイアログが表示されているか確認
  const hasEventDialog = document.querySelector('[data-eventid][role="dialog"]');

  if (hasEventDialog) {
    console.log('✅ MutationObserver: イベントダイアログを検出');
    console.log('hasEventDialog:', hasEventDialog);

    // 既存のボタンがあるか確認
    const existingButton = document.getElementById('eid-copy-button');
    if (!existingButton) {
      console.log('ボタンを追加します（500ms後）');
      // 少し遅延させてから実行（GoogleカレンダーのDOMが完全に構築されるのを待つ）
      setTimeout(addCopyButtonToEventDialog, 500);
    } else {
      console.log('ボタンは既に存在します');
    }
  }
});

// 監視を開始
console.log('MutationObserver を開始します');
if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  console.log('✅ MutationObserver が document.body を監視中');
} else {
  console.log('❌ document.body が存在しません');
}

// 定期的にイベントダイアログをチェック（フォールバック）
let lastDialogCheck = null;
const intervalId = setInterval(() => {
  const hasEventDialog = document.querySelector('[data-eventid][role="dialog"]');

  if (hasEventDialog && !lastDialogCheck) {
    console.log('⏰ 定期チェック: イベントダイアログを検出');
    lastDialogCheck = hasEventDialog;

    const existingButton = document.getElementById('eid-copy-button');
    if (!existingButton) {
      addCopyButtonToEventDialog();
    }
  } else if (!hasEventDialog && lastDialogCheck) {
    console.log('⏰ 定期チェック: イベントダイアログが閉じられました');
    lastDialogCheck = null;
  }
}, 500);

console.log('✅ 定期チェックを開始しました（500msごと）');

// 初回実行（既にダイアログが開いている場合）
console.log('初回実行をスケジュール（1000ms後）');
setTimeout(() => {
  console.log('初回実行を開始');
  const hasEventDialog = document.querySelector('[data-eventid][role="dialog"]');
  console.log('初回実行: hasEventDialog =', hasEventDialog);

  if (hasEventDialog) {
    console.log('初回実行: イベントダイアログが既に開いています');
    addCopyButtonToEventDialog();
  } else {
    console.log('初回実行: イベントダイアログは開いていません');
  }
}, 1000);

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
  notification.textContent = message;

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
