/**
 * Crypto News - 仮想通貨ニュース
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderNews();
  });

  function renderItems(container, data) {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      var n = data[i];
      html += '<a href="' + n.url + '" class="cnews-item" target="_blank" rel="noopener noreferrer">' +
        '<div class="cnews-item-body">' +
          '<div class="cnews-title-text">' + n.title + '</div>' +
          '<div class="cnews-excerpt">' + n.excerpt + '</div>' +
        '</div>' +
        '<div class="cnews-meta">' +
          '<span class="badge badge-primary cnews-source">' + n.source + '</span>' +
          '<span class="cnews-date">' + n.date + '</span>' +
        '</div>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  function renderNews() {
    var container = document.getElementById('cryptoNewsList');
    if (!container) return;

    fetch('/api/crypto/news', {
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
      if (typeof MOCK_CRYPTO_NEWS_ALL !== 'undefined') {
        renderItems(container, MOCK_CRYPTO_NEWS_ALL);
      }
    });
  }
})();
