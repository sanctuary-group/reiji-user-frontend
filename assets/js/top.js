/**
 * TOP Page JS - Banner slider, Notices, Videos, News
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initBannerSlider();
    renderNotices();
    renderVideos();
    renderCryptoNews();
    renderForexNews();
  });

  // ---- Banner Slider ----
  function initBannerSlider() {
    var viewport = document.getElementById('bannerViewport');
    var track = document.getElementById('bannerTrack');
    var dotsContainer = document.getElementById('bannerDots');
    if (!viewport || !track || !dotsContainer || typeof MOCK_BANNERS === 'undefined') return;

    // Render slides
    var slidesHtml = '';
    var dotsHtml = '';
    for (var i = 0; i < MOCK_BANNERS.length; i++) {
      var b = MOCK_BANNERS[i];
      slidesHtml += '<a href="' + b.url + '" class="banner-slide" style="background:' + b.bgColor + '">' +
        '<span class="banner-slide-title">' + b.title + '</span>' +
        '<span class="banner-slide-subtitle">' + b.subtitle + '</span>' +
      '</a>';
      var activeClass = i === 0 ? ' active' : '';
      dotsHtml += '<button class="banner-dot' + activeClass + '" data-index="' + i + '"></button>';
    }
    track.innerHTML = slidesHtml;
    dotsContainer.innerHTML = dotsHtml;

    var current = 0;
    var total = MOCK_BANNERS.length;
    var autoPlayTimer = null;

    function goTo(index) {
      current = index;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      var dots = dotsContainer.querySelectorAll('.banner-dot');
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('active', j === current);
      }
    }

    function next() {
      goTo((current + 1) % total);
    }

    function startAutoPlay() {
      autoPlayTimer = setInterval(next, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    // Dot clicks
    var dots = dotsContainer.querySelectorAll('.banner-dot');
    for (var k = 0; k < dots.length; k++) {
      dots[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        goTo(idx);
        stopAutoPlay();
        startAutoPlay();
      });
    }

    // Pause on hover
    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }

  // ---- Notices ----
  function renderNotices() {
    var container = document.getElementById('noticeTable');
    if (!container || typeof MOCK_NOTICES === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_NOTICES.length; i++) {
      var n = MOCK_NOTICES[i];
      html += '<div class="notice-row">' +
        '<span class="badge notice-tag ' + n.tagClass + '">' + n.tag + '</span>' +
        '<span class="notice-date">' + n.date + '</span>' +
        '<span class="notice-title">' + n.title + '</span>' +
        '<span class="notice-excerpt">' + n.excerpt + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // ---- Videos ----
  function renderVideos() {
    var container = document.getElementById('videoGrid');
    if (!container || typeof MOCK_VIDEOS === 'undefined') return;

    var isMobile = window.innerWidth <= 768;
    var maxItems = isMobile ? 2 : MOCK_VIDEOS.length;
    var html = '';
    for (var i = 0; i < maxItems && i < MOCK_VIDEOS.length; i++) {
      var v = MOCK_VIDEOS[i];
      html += '<div class="video-card">' +
        '<div class="video-thumb" style="background:' + v.bgColor + '"></div>' +
        '<div class="video-info">' +
          '<div class="video-title">' + v.title + '</div>' +
          '<div class="video-meta">' +
            '<span>' + v.date + '</span>' +
            '<span>再生 ' + v.views + '回</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // ---- News (shared renderer) ----
  function renderNewsItems(containerId, data) {
    var container = document.getElementById(containerId);
    if (!container || typeof data === 'undefined') return;

    var html = '';
    for (var i = 0; i < data.length; i++) {
      var n = data[i];
      html += '<a href="' + n.url + '" class="news-item" target="_blank" rel="noopener noreferrer">' +
        '<span class="news-title">' + n.title + '</span>' +
        '<span class="badge badge-primary news-source">' + n.source + '</span>' +
        '<span class="news-date">' + n.date + '</span>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  function renderCryptoNews() {
    fetch('/api/crypto/news', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderNewsItems('cryptoNewsList', json.data.slice(0, 5));
    })
    .catch(function () {
      if (typeof MOCK_CRYPTO_NEWS !== 'undefined') {
        renderNewsItems('cryptoNewsList', MOCK_CRYPTO_NEWS);
      }
    });
  }

  function renderForexNews() {
    fetch('/api/forex/news', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderNewsItems('forexNewsList', json.data.slice(0, 5));
    })
    .catch(function () {
      if (typeof MOCK_FOREX_NEWS !== 'undefined') {
        renderNewsItems('forexNewsList', MOCK_FOREX_NEWS);
      }
    });
  }
})();
