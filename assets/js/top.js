/**
 * TOP Page JS - Banner slider, Notices, Videos, News
 * Banner uses API: GET /api/posts/banners
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
    if (!viewport || !track || !dotsContainer) return;

    fetch('/api/posts/banners', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (banners) {
      if (banners && banners.length > 0) {
        renderBannerSlider(viewport, track, dotsContainer, banners);
      }
    })
    .catch(function () {
      // Silently fail — no banners to show
    });

  function renderBannerSlider(viewport, track, dotsContainer, banners) {
    var slidesHtml = '';
    var dotsHtml = '';
    for (var i = 0; i < banners.length; i++) {
      var b = banners[i];
      var imgFit = b.imageFit || 'cover';
      var bgSize = imgFit === 'auto' ? 'auto' : imgFit;
      var bgStyle = b.imageUrl
        ? 'background-image:url(' + b.imageUrl + ');background-size:' + bgSize + ';background-position:center;background-repeat:no-repeat;background-color:#1a1a2e'
        : 'background:' + (b.bgColor || '#1a1a2e');

      var titleColor = b.titleColor || '#ffffff';
      var btnRadius = b.btnBorderRadius !== undefined ? b.btnBorderRadius : 999;

      slidesHtml += '<div class="banner-slide" style="' + bgStyle + '">';
      slidesHtml += '<span class="banner-slide-title" style="color:' + titleColor + '">' + (b.title || '') + '</span>';

      // Subtitle
      if (b.subtitle) {
        slidesHtml += '<span class="banner-slide-subtitle" style="color:' + titleColor + '">' + b.subtitle + '</span>';
      }

      // CTA Button
      if (b.btnImageUrl) {
        var btnLink = b.btnUrl || b.url || '#';
        slidesHtml += '<a href="' + btnLink + '" target="_blank" rel="noopener" class="banner-cta-link" data-post-id="' + b.id + '">' +
          '<img src="' + b.btnImageUrl + '" class="banner-cta-image" style="border-radius:' + btnRadius + 'px" alt="">' +
        '</a>';
      } else if (b.btnText) {
        var btnLink2 = b.btnUrl || b.url || '#';
        slidesHtml += '<a href="' + btnLink2 + '" target="_blank" rel="noopener" class="banner-cta-link" data-post-id="' + b.id + '">';
        slidesHtml += '<span class="banner-cta-btn" style="background:' + (b.btnColor || '#F28B2D') + ';color:' + (b.btnTextColor || '#ffffff') + ';border-radius:' + btnRadius + 'px">' + b.btnText + '</span>';
        slidesHtml += '</a>';
      }

      slidesHtml += '</div>';

      var activeClass = i === 0 ? ' active' : '';
      dotsHtml += '<button class="banner-dot' + activeClass + '" data-index="' + i + '"></button>';
    }
    track.innerHTML = slidesHtml;
    dotsContainer.innerHTML = dotsHtml;

    var current = 0;
    var total = banners.length;
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

    var dots = dotsContainer.querySelectorAll('.banner-dot');
    for (var k = 0; k < dots.length; k++) {
      dots[k].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        goTo(idx);
        stopAutoPlay();
        startAutoPlay();
      });
    }

    // Track CTA button clicks
    var ctaLinks = track.querySelectorAll('.banner-cta-link');
    for (var m = 0; m < ctaLinks.length; m++) {
      ctaLinks[m].addEventListener('click', function () {
        var postId = this.getAttribute('data-post-id');
        if (postId) {
          navigator.sendBeacon('/api/posts/' + postId + '/click');
        }
      });
    }

    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('mouseleave', startAutoPlay);

    startAutoPlay();
  }
  } // end initBannerSlider

  // ---- Notices ----
  var TAG_MAP = {
    important:   { label: '重要',         cssClass: 'badge-loss' },
    feature:     { label: '新機能',       cssClass: 'badge-primary' },
    notice:      { label: 'お知らせ',     cssClass: 'badge-accent' },
    event:       { label: 'イベント',     cssClass: 'badge-accent' },
    maintenance: { label: 'メンテナンス', cssClass: 'badge-warning' }
  };

  function renderNotices() {
    var container = document.getElementById('noticeTable');
    if (!container) return;

    fetch('/api/notifications?page=1', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      var items = (json.data || []).slice(0, 3);
      renderNoticesFromApi(container, items);
    })
    .catch(function () {
      container.innerHTML = '<div class="notice-row"><span class="notice-title" style="color:var(--text-tertiary);">お知らせを取得できませんでした</span></div>';
    });
  }

  function renderNoticesFromApi(container, notices) {
    var html = '';
    for (var i = 0; i < notices.length; i++) {
      var n = notices[i];
      var tagInfo = TAG_MAP[n.tag] || { label: n.tag, cssClass: 'badge-accent' };
      var date = formatNoticeDate(n.publishedAt);
      html += '<a href="/notices/' + n.id + '" class="notice-row notice-row-link">' +
        '<span class="badge notice-tag ' + tagInfo.cssClass + '">' + tagInfo.label + '</span>' +
        '<span class="notice-date">' + date + '</span>' +
        '<span class="notice-title">' + escapeHtml(n.title) + '</span>' +
        '<span class="notice-excerpt">' + escapeHtml(n.excerpt) + '</span>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  function formatNoticeDate(isoStr) {
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

  // ---- Videos (Reijiの最新動画) ----
  function renderVideos() {
    var container = document.getElementById('videoGrid');
    if (!container) return;

    fetch('/api/useful-resources?type=video', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      var videos = (json.data || []).slice(0, 4);
      if (videos.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-4)">動画はまだありません</p>';
        return;
      }
      var html = '';
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        var date = v.publishedAt ? formatVideoDate(v.publishedAt) : '';
        html += '<a href="' + escapeHtml(v.url) + '" target="_blank" rel="noopener" class="video-card">' +
          '<div class="video-thumb"' + (v.imageUrl ? ' style="background-image:url(' + escapeHtml(v.imageUrl) + ');background-size:cover;background-position:center"' : '') + '></div>' +
          '<div class="video-info">' +
            '<div class="video-title">' + escapeHtml(v.title) + '</div>' +
            '<div class="video-meta">' +
              '<span>' + date + '</span>' +
            '</div>' +
          '</div>' +
        '</a>';
      }
      container.innerHTML = html;
    })
    .catch(function () {
      container.innerHTML = '<p style="text-align:center;color:var(--text-tertiary);padding:var(--space-4)">動画を取得できませんでした</p>';
    });
  }

  function formatVideoDate(isoStr) {
    if (!isoStr) return '';
    var d = new Date(isoStr);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
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
      var el = document.getElementById('cryptoNewsList');
      if (el) el.innerHTML = '<div class="news-item"><span class="news-title" style="color:var(--text-tertiary);">ニュースを取得できませんでした</span></div>';
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
      var el = document.getElementById('forexNewsList');
      if (el) el.innerHTML = '<div class="news-item"><span class="news-title" style="color:var(--text-tertiary);">ニュースを取得できませんでした</span></div>';
    });
  }
})();
