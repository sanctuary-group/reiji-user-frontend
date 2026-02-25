/**
 * Forex News - 為替ニュース
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderNews();
  });

  function renderItems(container, data) {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      var n = data[i];
      html += '<a href="' + n.url + '" class="fnews-item" target="_blank" rel="noopener noreferrer">' +
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

  function renderNews() {
    var container = document.getElementById('forexNewsList');
    if (!container) return;

    fetch('/api/forex/news', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderItems(container, json.data);
    })
    .catch(function () {
      if (typeof MOCK_FOREX_NEWS_ALL !== 'undefined') {
        renderItems(container, MOCK_FOREX_NEWS_ALL);
      }
    });
  }
})();
