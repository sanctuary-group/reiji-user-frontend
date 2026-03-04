/**
 * Sites - 有益サイト一覧
 * Uses API: GET /api/useful-resources?type=site&sub_type=site
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    loadSites();
  });

  function loadSites() {
    fetch('/api/useful-resources?type=site&sub_type=site', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderSites(json.data || []);
    })
    .catch(function () {
      renderSites([]);
    });
  }

  function renderSites(sites) {
    var container = document.getElementById('siteList');
    if (!container) return;

    if (sites.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-8)">サイトはまだありません</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < sites.length; i++) {
      var s = sites[i];
      var domain = extractDomain(s.url);

      html += '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener" class="site-item">' +
        '<div class="site-item-icon">' +
          (s.imageUrl
            ? '<img src="' + escapeHtml(s.imageUrl) + '" alt="">'
            : '<i class="fa-solid fa-globe"></i>') +
        '</div>' +
        '<div class="site-item-body">' +
          '<div class="site-item-title">' + escapeHtml(s.title) + '</div>' +
          '<div class="site-item-url">' + escapeHtml(domain) + '</div>' +
          (s.description ? '<div class="site-item-desc">' + escapeHtml(s.description) + '</div>' : '') +
        '</div>' +
        '<span class="site-item-arrow"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  function extractDomain(url) {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
