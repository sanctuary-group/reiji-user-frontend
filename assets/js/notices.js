/**
 * Notices - お知らせ一覧
 * Uses API: GET /api/notifications
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
    loadNotices();
  });

  function loadNotices() {
    fetch('/api/notifications', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderNotices(json.data || []);
    })
    .catch(function () {
      var c = document.getElementById('noticeList');
      if (c) c.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-8)">お知らせを取得できませんでした</p>';
    });
  }

  function renderNotices(notices) {
    var container = document.getElementById('noticeList');
    if (!container) return;

    if (notices.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-8)">お知らせはまだありません</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < notices.length; i++) {
      var n = notices[i];
      var tagInfo = TAG_MAP[n.tag] || { label: n.tag, cssClass: 'badge-accent' };
      var date = formatDate(n.publishedAt);

      html += '<a href="/notices/' + n.id + '" class="ntc-card-link">' +
        '<div class="ntc-card">' +
          '<div class="ntc-card-top">' +
            '<span class="badge ntc-tag ' + tagInfo.cssClass + '">' + tagInfo.label + '</span>' +
            '<span class="ntc-card-date">' + date + '</span>' +
          '</div>' +
          '<h2 class="ntc-card-title">' + escapeHtml(n.title) + '</h2>' +
          '<p class="ntc-card-excerpt">' + escapeHtml(n.excerpt) + '</p>' +
        '</div>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
