/**
 * Crypto News - 仮想通貨ニュース
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderNews();
  });

  function renderNews() {
    var container = document.getElementById('cryptoNewsList');
    if (!container || typeof MOCK_CRYPTO_NEWS_ALL === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_CRYPTO_NEWS_ALL.length; i++) {
      var n = MOCK_CRYPTO_NEWS_ALL[i];
      html += '<a href="' + n.url + '" class="cnews-item">' +
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
})();
