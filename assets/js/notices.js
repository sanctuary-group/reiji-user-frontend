/**
 * Notices - お知らせ一覧
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderNotices();
  });

  function renderNotices() {
    var container = document.getElementById('noticeList');
    if (!container || typeof MOCK_NOTICES_ALL === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_NOTICES_ALL.length; i++) {
      var n = MOCK_NOTICES_ALL[i];
      html += '<div class="ntc-card">' +
        '<div class="ntc-card-top">' +
          '<span class="badge ntc-tag ' + n.tagClass + '">' + n.tag + '</span>' +
          '<span class="ntc-card-date">' + n.date + '</span>' +
        '</div>' +
        '<h2 class="ntc-card-title">' + n.title + '</h2>' +
        '<p class="ntc-card-excerpt">' + n.excerpt + '</p>' +
      '</div>';
    }
    container.innerHTML = html;
  }
})();
