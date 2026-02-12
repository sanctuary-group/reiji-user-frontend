/**
 * Videos - 動画一覧
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderVideos();
  });

  function renderVideos() {
    var container = document.getElementById('videoGrid');
    if (!container || typeof MOCK_VIDEOS_ALL === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_VIDEOS_ALL.length; i++) {
      var v = MOCK_VIDEOS_ALL[i];
      html += '<div class="vid-card">' +
        '<div class="vid-thumb" style="background:' + v.bgColor + '"></div>' +
        '<div class="vid-info">' +
          '<div class="vid-title-text">' + v.title + '</div>' +
          '<div class="vid-meta">' +
            '<span>' + v.date + '</span>' +
            '<span>再生 ' + v.views + '回</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }
})();
