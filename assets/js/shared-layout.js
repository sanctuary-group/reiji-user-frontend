/**
 * Shared Layout JS - Common across all pages using user-app layout
 * Ticker, Forex Rates, Clock, Sidebar Accordion, Right Sidebar, Mobile Menu
 */
(function () {
  // ---- Crypto Data (shared between ticker and rankings) ----
  var _cryptoMarketsData = null;
  var _cryptoTrendingData = null;

  document.addEventListener('DOMContentLoaded', function () {
    loadCryptoData();
    initForexRates();
    startClock();
    initSidebarAccordion();
    renderRightUser();
    renderPnlSummary();
    initCryptoTabs();
    renderEconomicIndicators();
    initMobileMenu();
    initActiveNav();
    initLoginGuards();
  });

  function loadCryptoData() {
    // Fetch markets (used for ticker + Top5 ranking)
    fetch('/api/crypto/markets', { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (json) {
        var allData = json.data || [];
        var track = document.getElementById('tickerTrack');
        if (track && allData.length > 0) renderTickerItems(track, allData);
        _cryptoMarketsData = allData.slice(0, 5);
        renderCryptoRates('top5');
      })
      .catch(function () {
        var track = document.getElementById('tickerTrack');
        if (track) track.parentElement.style.display = 'none';
        var container = document.getElementById('rightCryptoList');
        if (container) container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-tertiary);">データを取得できませんでした</div>';
      });

    // Fetch trending (separate API)
    fetch('/api/crypto/trending', { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (json) {
        _cryptoTrendingData = json.data || [];
      })
      .catch(function () {
        _cryptoTrendingData = [];
      });
  }

  // ---- Crypto Ticker ----
  function renderTickerItems(track, data) {
    var html = '';
    for (var i = 0; i < data.length; i++) {
      var c = data[i];
      var changeClass = c.change >= 0 ? 'up' : 'down';
      var changeSign = c.change >= 0 ? '+' : '';
      var priceStr = c.price >= 1000 ? new Intl.NumberFormat('ja-JP').format(c.price) : c.price.toFixed(2);
      html += '<div class="ticker-item">' +
        '<span class="ticker-symbol">' + c.symbol + '</span>' +
        '<span class="ticker-price">¥' + priceStr + '</span>' +
        '<span class="ticker-change ' + changeClass + '">' + changeSign + c.change.toFixed(2) + '%</span>' +
      '</div>';
    }
    track.innerHTML = html + html;
  }

  // ---- Forex Rates ----
  function initForexRates() {
    var container = document.getElementById('forexRates');
    if (!container) return;

    fetch('/api/forex/rates', { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (json) {
        var data = json.data || [];
        if (data.length === 0) return;
        var html = '';
        for (var i = 0; i < data.length; i++) {
          var r = data[i];
          var changeClass = r.change >= 0 ? 'up' : 'down';
          var changeSign = r.change >= 0 ? '+' : '';
          var valStr = r.decimals === 4 ? r.value.toFixed(4) : r.value.toFixed(2);
          html += '<div class="forex-item">' +
            '<span class="forex-pair">' + r.pair + '</span>' +
            '<span class="forex-value">' + valStr + '</span>' +
            '<span class="forex-change ' + changeClass + '">(' + changeSign + r.change + ')</span>' +
          '</div>';
        }
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<div class="forex-item"><span class="forex-pair" style="color:var(--text-tertiary);">為替データを取得できませんでした</span></div>';
      });
  }

  // ---- Clock ----
  function startClock() {
    var el = document.getElementById('siteClock');
    if (!el) return;

    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    function update() {
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth() + 1;
      var d = now.getDate();
      var w = weekdays[now.getDay()];
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      var ss = String(now.getSeconds()).padStart(2, '0');

      el.innerHTML =
        '<span class="site-clock-date">' + y + '/' + m + '/' + d + '(' + w + ') </span>' +
        '<span class="site-clock-time">' + hh + ':' + mm + ':' + ss + '</span>';
    }

    update();
    setInterval(update, 1000);
  }

  // ---- Left Sidebar Navigation Data ----
  var SIDEBAR_NAV_LINKS = [
    {
      label: '損益記録',
      icon: '<i class="fa-solid fa-chart-column"></i>',
      items: [
        { label: 'カレンダー', href: '/calendar' },
        { label: '月間損益', href: '/report', period: 'monthly' },
        { label: '年間損益', href: '/report', period: 'yearly' },
        { label: '生涯損益', href: '/report', period: 'lifetime' },
        { label: '損益グラフ', href: '/graph' },
        { label: '口座入出金管理', href: '/deposit' }
      ]
    },
    {
      label: 'シミュレーション',
      icon: '<i class="fa-solid fa-calculator"></i>',
      items: [
        { label: '税金計算ツール', href: '/tax-calculator' }
      ]
    }
  ];

  // ---- Left Sidebar Accordion ----
  function initSidebarAccordion() {
    var container = document.getElementById('sidebarGroups');
    if (!container) return;

    var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    // Detect initial active period from report tab if on report page
    var activePeriodTab = document.querySelector('.report-period-tab.active');
    var activePeriod = activePeriodTab ? activePeriodTab.getAttribute('data-period') : null;
    var activeGroupIndex = -1;
    var activeFound = false;

    var html = '';
    for (var i = 0; i < SIDEBAR_NAV_LINKS.length; i++) {
      var group = SIDEBAR_NAV_LINKS[i];
      html += '<div class="sidebar-group-item">';
      html += '<button class="sidebar-group-header">' +
        '<span class="sidebar-group-icon">' + group.icon + '</span>' +
        '<span class="sidebar-group-label">' + group.label + '</span>' +
        '<span class="sidebar-group-chevron"><i class="fa-solid fa-chevron-right"></i></span>' +
      '</button>';
      html += '<div class="sidebar-group-children">';
      for (var j = 0; j < group.items.length; j++) {
        var item = group.items[j];
        var periodAttr = item.period ? ' data-period="' + item.period + '"' : '';
        var isActive;
        if (item.period && item.href === currentPage) {
          isActive = item.period === activePeriod;
        } else {
          isActive = !activeFound && item.href === currentPage;
        }
        var activeClass = isActive ? ' active' : '';
        if (isActive) { activeGroupIndex = i; activeFound = true; }
        html += '<a href="' + item.href + '" class="sidebar-child-link' + activeClass + '"' + periodAttr + '>' + item.label + '</a>';
      }
      html += '</div>';
      html += '</div>';
    }
    container.innerHTML = html;

    // Open the group containing the active link, or the first group as fallback
    var groups = container.querySelectorAll('.sidebar-group-item');
    var openIndex = activeGroupIndex >= 0 ? activeGroupIndex : 0;
    if (groups[openIndex]) {
      groups[openIndex].classList.add('open');
    }

    setupAccordionHandlers(container, currentPage);

    // Guard sidebar links for unauthenticated users (on sidebarLeft to cover dynamic groups too)
    var sidebarLeft = document.getElementById('sidebarLeft');
    if (sidebarLeft) {
      sidebarLeft.addEventListener('click', function (e) {
        var link = e.target.closest('a.sidebar-child-link');
        if (link && !window.REIJI_IS_LOGGED_IN) {
          e.preventDefault();
          window.REIJI_REQUIRE_LOGIN();
        }
      });
    }

    // Load dynamic resource groups from API
    loadResourceSidebarGroups(container);

    // Load LINE CTA from API
    loadLineCta();
  }

  function setupAccordionHandlers(container, currentPage) {
    // Accordion click handlers
    var headers = container.querySelectorAll('.sidebar-group-header');
    for (var k = 0; k < headers.length; k++) {
      headers[k].addEventListener('click', function () {
        var item = this.parentElement;
        item.classList.toggle('open');
      });
    }

    // Period-based sidebar link click handlers
    var periodLinks = container.querySelectorAll('.sidebar-child-link[data-period]');
    for (var p = 0; p < periodLinks.length; p++) {
      periodLinks[p].addEventListener('click', function (e) {
        if (!window.REIJI_IS_LOGGED_IN) {
          e.preventDefault();
          window.REIJI_REQUIRE_LOGIN();
          return;
        }
        var period = this.getAttribute('data-period');
        var href = this.getAttribute('href');
        if (currentPage === href && window._switchReportPeriod) {
          e.preventDefault();
          window._switchReportPeriod(period);
          for (var q = 0; q < periodLinks.length; q++) {
            periodLinks[q].classList.toggle('active', periodLinks[q].getAttribute('data-period') === period);
          }
        } else {
          e.preventDefault();
          window.location.href = href + '?period=' + period;
        }
      });
    }
  }

  function loadLineCta() {
    var cta = document.getElementById('sidebarLineCta');
    var textEl = document.getElementById('sidebarLineText');

    fetch('/api/site-settings/line', { headers: { 'Accept': 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        // Sidebar LINE CTA
        if (cta) {
          if (data.line_enabled === 'true') {
            if (data.line_url) cta.href = data.line_url;
            if (data.line_text && textEl) textEl.textContent = data.line_text;
            cta.style.display = '';
          }
        }

        // Footer links
        var footerLine = document.getElementById('footerLineLink');
        var footerYoutube = document.getElementById('footerYoutubeLink');
        var footerX = document.getElementById('footerXLink');
        var footerDiscord = document.getElementById('footerDiscordLink');
        if (footerLine) {
          if (data.line_url) {
            footerLine.href = data.line_url;
          } else {
            footerLine.style.display = 'none';
          }
        }
        if (footerYoutube) {
          if (data.youtube_url) {
            footerYoutube.href = data.youtube_url;
          } else {
            footerYoutube.style.display = 'none';
          }
        }
        if (footerX) {
          if (data.x_url) {
            footerX.href = data.x_url;
            footerX.style.display = '';
          }
        }
        if (footerDiscord) {
          if (data.discord_url) {
            footerDiscord.href = data.discord_url;
            footerDiscord.style.display = '';
          }
        }

        // Sidebar SNS icons
        var snsContainer = document.getElementById('sidebarSnsIcons');
        var snsLinks = [
          { id: 'sidebarSnsYoutube', url: data.youtube_url },
          { id: 'sidebarSnsX', url: data.x_url },
          { id: 'sidebarSnsDiscord', url: data.discord_url },
        ];
        var hasAnySns = false;
        for (var i = 0; i < snsLinks.length; i++) {
          var el = document.getElementById(snsLinks[i].id);
          if (el) {
            if (snsLinks[i].url) {
              el.href = snsLinks[i].url;
              el.style.display = '';
              hasAnySns = true;
            }
          }
        }
        if (snsContainer && hasAnySns) {
          snsContainer.style.display = '';
        }
      })
      .catch(function () {
        if (cta) cta.style.display = '';
      });
  }

  function loadResourceSidebarGroups(container) {
    var resourceGroups = [
      { subType: 'site',  label: '有益サイト一覧', icon: '<i class="fa-solid fa-globe"></i>', allHref: '/sites' },
      { subType: 'video', label: '有益動画まとめ', icon: '<i class="fa-solid fa-video"></i>', allHref: '/informative-video' }
    ];

    resourceGroups.forEach(function (group) {
      fetch('/api/useful-resources?sub_type=' + group.subType, {
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (json) {
        var items = (json.data || []).map(function (item) {
          return { label: item.title, href: item.url, external: true };
        });
        if (items.length === 0) return;
        renderSidebarGroup(container, group, items);
      })
      .catch(function () {
        // Silently fail — no resources to show
      });
    });
  }

  function renderSidebarGroup(container, group, items) {
    var groupHtml = '<div class="sidebar-group-item">';
    groupHtml += '<button class="sidebar-group-header">' +
      '<span class="sidebar-group-icon">' + group.icon + '</span>' +
      '<span class="sidebar-group-label">' + group.label + '</span>' +
      '<span class="sidebar-group-chevron"><i class="fa-solid fa-chevron-right"></i></span>' +
    '</button>';
    groupHtml += '<div class="sidebar-group-children">';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var targetAttr = item.external ? ' target="_blank" rel="noopener"' : '';
      groupHtml += '<a href="' + escapeAttr(item.href) + '"' + targetAttr + ' class="sidebar-child-link">' + escapeHtmlText(item.label) + '</a>';
    }
    groupHtml += '</div>';
    groupHtml += '</div>';

    var lineCta = container.parentElement.querySelector('.sidebar-line-cta');
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = groupHtml;
    var groupEl = tempDiv.firstChild;

    if (lineCta) {
      lineCta.parentElement.insertBefore(groupEl, lineCta);
    } else {
      container.appendChild(groupEl);
    }

    // Attach accordion handler to the new group
    groupEl.querySelector('.sidebar-group-header').addEventListener('click', function () {
      groupEl.classList.toggle('open');
    });
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeHtmlText(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---- Right Sidebar: User ----
  function renderRightUser() {
    var defaultAvatar = 'assets/img/avatars/default.svg';

    // Show login button for unauthenticated users
    if (!window.REIJI_IS_LOGGED_IN && !localStorage.getItem('reiji_token')) {
      var rightUser = document.querySelector('.right-user');
      if (rightUser) {
        rightUser.innerHTML =
          '<a href="/login" class="btn btn-primary btn-sm" style="width:100%;">ログイン / 新規登録</a>';
      }
      return;
    }

    function applyUser(user) {
      var displayName = (user && user.display_name) || (user && user.line_name) || '---';
      var avatarSrc = (user && user.avatar) ? '/storage/' + user.avatar : defaultAvatar;

      var nameEl = document.getElementById('rightUserName');
      if (nameEl) nameEl.textContent = displayName;
      var avatarEl = document.getElementById('rightUserAvatar');
      if (avatarEl) avatarEl.src = avatarSrc;

      var mobileName = document.querySelector('.sidebar-mobile-user-name');
      if (mobileName) mobileName.textContent = displayName;
      var mobileAvatar = document.getElementById('mobileUserAvatar');
      if (mobileAvatar) mobileAvatar.src = avatarSrc;
    }

    // Initial render with REIJI_USER if available
    applyUser(window.REIJI_USER);

    // Poll for REIJI_USER (set by auth.js after API call)
    if (!window.REIJI_USER) {
      var pollInterval = setInterval(function () {
        if (window.REIJI_USER) {
          clearInterval(pollInterval);
          applyUser(window.REIJI_USER);
        }
      }, 50);
    }

    // Add dropdown to right sidebar user panel
    var rightUser = document.querySelector('.right-user');
    if (rightUser) {
      var dropdown = document.createElement('div');
      dropdown.className = 'right-user-dropdown';
      dropdown.innerHTML =
        '<a href="/settings" class="right-user-dropdown-item">' +
          '<i class="fa-solid fa-gear"></i> ユーザー設定</a>' +
        '<a href="#" class="right-user-dropdown-item right-user-logout">' +
          '<i class="fa-solid fa-right-from-bracket"></i> ログアウト</a>';
      rightUser.appendChild(dropdown);

      dropdown.querySelector('.right-user-logout').addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof window.REIJI_LOGOUT === 'function') window.REIJI_LOGOUT();
      });

      rightUser.addEventListener('click', function (e) {
        e.stopPropagation();
        rightUser.classList.toggle('open');
      });

      document.addEventListener('click', function () {
        rightUser.classList.remove('open');
      });
    }

    // Add user section to left sidebar for mobile hamburger menu
    var sidebarLeft = document.getElementById('sidebarLeft');
    if (!sidebarLeft) return;

    var mobileUser = document.createElement('div');
    mobileUser.className = 'sidebar-mobile-user';
    mobileUser.innerHTML =
      '<div class="sidebar-mobile-user-info">' +
        '<div class="avatar avatar-sm avatar-ring">' +
          '<img id="mobileUserAvatar" src="' + defaultAvatar + '" alt="">' +
        '</div>' +
        '<span class="sidebar-mobile-user-name">---</span>' +
      '</div>' +
      '<a href="/settings" class="sidebar-mobile-user-link">' +
        '<i class="fa-solid fa-gear"></i> ユーザー設定</a>' +
      '<a href="#" class="sidebar-mobile-user-link sidebar-mobile-logout">' +
        '<i class="fa-solid fa-right-from-bracket"></i> ログアウト</a>';

    sidebarLeft.appendChild(mobileUser);

    mobileUser.querySelector('.sidebar-mobile-logout').addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof window.REIJI_LOGOUT === 'function') window.REIJI_LOGOUT();
    });

    // Apply user data to mobile section if already available
    applyUser(window.REIJI_USER);
  }

  // ---- Right Sidebar: P&L Summary ----
  function renderPnlSummary() {
    var container = document.getElementById('rightPnlSummary');
    if (!container) return;

    if (!window.REIJI_IS_LOGGED_IN && !localStorage.getItem('reiji_token')) {
      container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-tertiary);font-size:var(--text-sm);">ログインすると損益サマリーが表示されます</div>';
      return;
    }

    apiFetch('/api/pnl/summary')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        renderPnlSummaryHtml(container, [
          { label: '今日の損益', value: data.today, href: 'calendar.html' },
          { label: '今月の損益', value: data.month, href: 'report.html' },
          { label: '今年の損益', value: data.year, href: 'report.html?period=yearly' }
        ]);
      })
      .catch(function () {
        container.innerHTML = '<div class="right-pnl-item"><span class="right-pnl-label">データを取得できませんでした</span></div>';
      });
  }

  function renderPnlSummaryHtml(container, items) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var valueClass = item.value >= 0 ? 'text-profit' : 'text-loss';
      html += '<a href="' + item.href + '" class="right-pnl-item">' +
        '<span class="right-pnl-label">' + item.label + '</span>' +
        '<span class="right-pnl-value ' + valueClass + '">' + formatYen(item.value) + '</span>' +
        '<span class="right-pnl-arrow"><i class="fa-solid fa-chevron-right"></i></span>' +
      '</a>';
    }
    container.innerHTML = html;
  }

  // ---- Right Sidebar: Crypto Rates ----
  function renderCryptoRates(tab) {
    var container = document.getElementById('rightCryptoList');
    if (!container) return;

    var data = tab === 'trending' ? _cryptoTrendingData : _cryptoMarketsData;
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-tertiary);">データを取得できませんでした</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
      var coin = data[i];
      var changeClass = coin.change >= 0 ? 'text-profit' : 'text-loss';
      var changeSign = coin.change >= 0 ? '+' : '';
      var priceStr = coin.price >= 1000 ? new Intl.NumberFormat('ja-JP').format(coin.price) : coin.price.toFixed(4);
      html += '<div class="right-crypto-item">' +
        '<span class="right-crypto-rank">' + coin.rank + '</span>' +
        '<div class="right-crypto-name">' +
          '<div class="right-crypto-symbol">' + coin.symbol + '</div>' +
          '<div class="right-crypto-fullname">' + coin.name + '</div>' +
        '</div>' +
        '<span class="right-crypto-price">¥' + priceStr + '</span>' +
        '<span class="right-crypto-change ' + changeClass + '">' + changeSign + coin.change.toFixed(1) + '%</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // Make renderCryptoRates accessible for tab switching
  window._renderCryptoRates = renderCryptoRates;

  // Update sidebar active link by period (called from report.js)
  window._updateSidebarPeriod = function (period) {
    var links = document.querySelectorAll('.sidebar-child-link[data-period]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('data-period') === period) {
        links[i].classList.add('active');
      } else {
        links[i].classList.remove('active');
      }
    }
  };

  function initCryptoTabs() {
    var tabs = document.querySelectorAll('.right-crypto-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var siblings = this.parentElement.querySelectorAll('.right-crypto-tab');
        for (var j = 0; j < siblings.length; j++) {
          siblings[j].classList.remove('active');
        }
        this.classList.add('active');
        var tab = this.getAttribute('data-tab');
        window._renderCryptoRates(tab);
      });
    }
  }

  // ---- Right Sidebar: Economic Indicators ----
  function renderEconomicIndicators() {
    var container = document.getElementById('rightIndicators');
    if (!container) return;

    fetch('/api/economic/indicators', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderIndicatorItems(container, json.data);
    })
    .catch(function () {
      container.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--text-tertiary);">経済指標を取得できませんでした</div>';
    });
  }

  function renderIndicatorItems(container, data) {
    if (!data || data.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:1rem;color:#888;">本日の経済指標はありません</div>';
      return;
    }

    var html = '';
    var max = Math.min(data.length, 10);
    for (var i = 0; i < max; i++) {
      var ind = data[i];
      var starCount = ind.importance || 1;
      var stars = Array(starCount + 1).join('★');
      var level = starCount >= 4 ? 'high' : starCount >= 3 ? 'medium' : 'low';
      html += '<div class="right-indicator-item">' +
        '<span class="right-indicator-time">' + ind.time + '</span>' +
        '<span class="right-indicator-country">' + ind.country + '</span>' +
        '<span class="right-indicator-name">' + ind.name + '</span>' +
        '<span class="right-indicator-importance ' + level + '">' + stars + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    var hamburger = document.getElementById('siteHamburger');
    var sidebar = document.getElementById('sidebarLeft');
    var overlay = document.getElementById('sidebarOverlay');
    if (!hamburger) return;

    hamburger.addEventListener('click', function () {
      if (sidebar) {
        sidebar.classList.toggle('open');
        hamburger.classList.toggle('open');
      }
      if (overlay) {
        overlay.classList.toggle('active');
      }
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        if (sidebar) sidebar.classList.remove('open');
        if (hamburger) hamburger.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }

  // ---- Active Nav Tab ----
  function initActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    var tabs = document.querySelectorAll('.site-nav-tab');
    for (var i = 0; i < tabs.length; i++) {
      var href = tabs[i].getAttribute('href');
      if (href === currentPage) {
        tabs[i].classList.add('active');
      } else {
        tabs[i].classList.remove('active');
      }
    }
  }

  // ---- Login Guards for unauthenticated users ----
  function initLoginGuards() {
    if (window.REIJI_IS_LOGGED_IN || localStorage.getItem('reiji_token')) return;

    // Guard nav tabs (except TOPページ link to /)
    var tabs = document.querySelectorAll('.site-nav-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!window.REIJI_IS_LOGGED_IN && href !== '/' && href !== '#') {
          e.preventDefault();
          window.REIJI_REQUIRE_LOGIN();
        }
      });
    }

    // Guard right sidebar links (except login link)
    var rightSidebar = document.querySelector('.site-sidebar-right');
    if (rightSidebar) {
      rightSidebar.addEventListener('click', function (e) {
        var link = e.target.closest('a');
        if (link && !window.REIJI_IS_LOGGED_IN && link.getAttribute('href') !== '/login') {
          e.preventDefault();
          window.REIJI_REQUIRE_LOGIN();
        }
      });
    }
  }
})();

/* ---- Global Toast ---- */
(function () {
  var toastTimer = null;

  window.showGlobalToast = function (message, type) {
    var existing = document.querySelector('.user-toast');
    if (existing) existing.remove();
    if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }

    var isError = type === 'error';
    var toast = document.createElement('div');
    toast.className = 'user-toast ' + (isError ? 'error' : 'success');
    toast.innerHTML = '<i class="fa-solid ' + (isError ? 'fa-circle-exclamation' : 'fa-circle-check') +
      '"></i><span>' + message + '</span>';
    document.body.appendChild(toast);

    toastTimer = setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  };
})();
