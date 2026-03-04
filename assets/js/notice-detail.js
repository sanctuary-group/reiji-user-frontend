/**
 * Notice Detail Page
 * Uses API: GET /api/notifications/:id
 */
(function () {
  var TAG_MAP = {
    important:   { label: '重要',         cssClass: 'badge-loss' },
    feature:     { label: '新機能',       cssClass: 'badge-primary' },
    notice:      { label: 'お知らせ',     cssClass: 'badge-accent' },
    event:       { label: 'イベント',     cssClass: 'badge-accent' },
    maintenance: { label: 'メンテナンス', cssClass: 'badge-warning' }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var noticeId = getNoticeIdFromUrl();
    if (noticeId) {
      loadNotice(noticeId);
    } else {
      window.location.href = '/notices';
    }
  });

  function getNoticeIdFromUrl() {
    var match = window.location.pathname.match(/\/notices\/(\d+)/);
    return match ? match[1] : null;
  }

  function loadNotice(id) {
    fetch('/api/notifications/' + id, {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(function (notice) {
      renderNoticeDetail(notice);
      document.title = notice.title + ' | REIJI';
    })
    .catch(function () {
      renderNotFound();
    });
  }

  function renderNoticeDetail(notice) {
    var container = document.getElementById('noticeDetail');
    if (!container) return;

    var tagInfo = TAG_MAP[notice.tag] || { label: notice.tag, cssClass: 'badge-accent' };
    var date = formatDate(notice.publishedAt);

    var html = '';

    // Header
    html += '<div class="notice-detail-header">' +
      '<a href="/notices" class="notice-detail-back"><i class="fa-solid fa-arrow-left"></i> お知らせ一覧</a>' +
      '<div class="notice-detail-meta">' +
        '<span class="badge ntc-tag ' + tagInfo.cssClass + '">' + tagInfo.label + '</span>' +
        '<span class="notice-detail-date"><i class="fa-solid fa-clock"></i> ' + date + '</span>' +
      '</div>' +
      '<h1 class="notice-detail-title">' + escapeHtml(notice.title) + '</h1>' +
    '</div>';

    // Body
    if (notice.body) {
      html += '<div class="notice-detail-body">' + renderMarkdown(notice.body) + '</div>';
    }

    // Back link
    html += '<div class="notice-detail-footer">' +
      '<a href="/notices" class="btn btn-ghost"><i class="fa-solid fa-arrow-left"></i> お知らせ一覧に戻る</a>' +
    '</div>';

    container.innerHTML = html;
  }

  function renderNotFound() {
    var container = document.getElementById('noticeDetail');
    if (!container) return;

    container.innerHTML = '<div class="notice-not-found">' +
      '<i class="fa-solid fa-exclamation-circle"></i>' +
      '<h2>お知らせが見つかりません</h2>' +
      '<p>このお知らせは削除されたか、まだ公開されていません。</p>' +
      '<a href="/notices" class="btn btn-primary">お知らせ一覧に戻る</a>' +
    '</div>';
  }

  function renderMarkdown(text) {
    if (!text) return '';
    var html = escapeHtml(text);
    // Headings
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Newlines
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }
})();
