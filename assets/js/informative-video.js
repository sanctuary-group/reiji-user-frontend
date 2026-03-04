/**
 * Informative Video - 有益動画まとめ
 * Uses API: GET /api/useful-resources?sub_type=video
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    loadVideos();
  });

  function loadVideos() {
    fetch('/api/useful-resources?sub_type=video', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderVideos(json.data || []);
    })
    .catch(function () {
      renderVideos([]);
    });
  }

  function renderVideos(videos) {
    var container = document.getElementById('videoGrid');
    if (!container) return;

    if (videos.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);grid-column:1/-1">動画はまだありません</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      var date = formatDate(v.publishedAt);

      html += '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener" class="iv-card">' +
        '<div class="iv-thumb"' + (v.imageUrl ? ' style="background-image:url(' + escapeHtml(v.imageUrl) + ');background-size:cover;background-position:center"' : '') + '></div>' +
        '<div class="iv-info">' +
          '<div class="iv-card-title">' + escapeHtml(v.title) + '</div>' +
          '<div class="iv-meta">' +
            '<span>' + date + '</span>' +
          '</div>' +
          (v.description ? '<p class="iv-desc">' + escapeHtml(v.description) + '</p>' : '') +
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
