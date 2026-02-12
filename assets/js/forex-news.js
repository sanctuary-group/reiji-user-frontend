/**
 * Forex News - 為替ニュース
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderNews();
  });

  function renderNews() {
    var container = document.getElementById('forexNewsList');
    if (!container || typeof MOCK_FOREX_NEWS_ALL === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_FOREX_NEWS_ALL.length; i++) {
      var n = MOCK_FOREX_NEWS_ALL[i];
      html += '<a href="' + n.url + '" class="fnews-item">' +
        '<div class="fnews-item-body">' +
          '<div class="fnews-title-text">' + n.title + '</div>' +
          '<div class="fnews-excerpt">' + n.excerpt + '</div>' +
        '</div>' +
        '<div class="fnews-meta">' +
          '<span class="badge badge-primary fnews-source">' + n.source + '</span>' +
          '<span class="fnews-date">' + n.date + '</span>' +
        '</div>' +
      '</a>';
    }
    container.innerHTML = html;
  }
})();
