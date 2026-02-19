/**
 * Shared Layout JS - Common across all authenticated pages
 * Ticker, Forex Rates, Clock, Sidebar Accordion, Right Sidebar, Mobile Menu
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initTicker();
    initForexRates();
    startClock();
    initSidebarAccordion();
    renderRightUser();
    renderPnlSummary();
    renderCryptoRates('top5');
    initCryptoTabs();
    renderEconomicIndicators();
    initMobileMenu();
    initActiveNav();
  });

  // ---- Crypto Ticker ----
  function initTicker() {
    var track = document.getElementById('tickerTrack');
    if (!track || typeof MOCK_CRYPTO_TICKER === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_CRYPTO_TICKER.length; i++) {
      var c = MOCK_CRYPTO_TICKER[i];
      var changeClass = c.change >= 0 ? 'up' : 'down';
      var changeSign = c.change >= 0 ? '+' : '';
      var priceStr = c.price >= 1000 ? formatYen(c.price).replace('¥', '') : c.price.toFixed(2);
      html += '<div class="ticker-item">' +
        '<span class="ticker-symbol">' + c.symbol + '</span>' +
        '<span class="ticker-price">¥' + priceStr + '</span>' +
        '<span class="ticker-change ' + changeClass + '">' + changeSign + c.change.toFixed(2) + '%</span>' +
      '</div>';
    }
    // Duplicate for seamless loop
    track.innerHTML = html + html;
  }

  // ---- Forex Rates ----
  function initForexRates() {
    var container = document.getElementById('forexRates');
    if (!container || typeof MOCK_FOREX_RATES === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_FOREX_RATES.length; i++) {
      var r = MOCK_FOREX_RATES[i];
      var changeClass = r.change >= 0 ? 'up' : 'down';
      var changeSign = r.change >= 0 ? '+' : '';
      var valStr = r.pair === 'ユーロ/ドル' ? r.value.toFixed(4) : r.value.toFixed(2);
      html += '<div class="forex-item">' +
        '<span class="forex-pair">' + r.pair + '</span>' +
        '<span class="forex-value">' + valStr + '</span>' +
        '<span class="forex-change ' + changeClass + '">(' + changeSign + r.change + ')</span>' +
      '</div>';
    }
    container.innerHTML = html;
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

  // ---- Left Sidebar Accordion ----
  function initSidebarAccordion() {
    var container = document.getElementById('sidebarGroups');
    if (!container || typeof MOCK_SIDEBAR_LINKS === 'undefined') return;

    var currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    // Detect initial active period from report tab if on report page
    var activePeriodTab = document.querySelector('.report-period-tab.active');
    var activePeriod = activePeriodTab ? activePeriodTab.getAttribute('data-period') : null;
    var activeGroupIndex = -1;
    var activeFound = false;

    var html = '';
    for (var i = 0; i < MOCK_SIDEBAR_LINKS.length; i++) {
      var group = MOCK_SIDEBAR_LINKS[i];
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
        var period = this.getAttribute('data-period');
        var href = this.getAttribute('href');
        if (currentPage === href && window._switchReportPeriod) {
          // Already on report page — just switch period without navigation
          e.preventDefault();
          window._switchReportPeriod(period);
          // Update sidebar active states
          for (var q = 0; q < periodLinks.length; q++) {
            periodLinks[q].classList.toggle('active', periodLinks[q].getAttribute('data-period') === period);
          }
        } else {
          // Navigate to report page with period param
          e.preventDefault();
          window.location.href = href + '?period=' + period;
        }
      });
    }
  }

  // ---- Right Sidebar: User ----
  function renderRightUser() {
    var nameEl = document.getElementById('rightUserName');
    if (nameEl && typeof MOCK_USER !== 'undefined') {
      nameEl.textContent = MOCK_USER.name;
    }

    var userPanel = document.querySelector('.right-user');
    if (!userPanel) return;

    // Add dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'right-user-dropdown';
    dropdown.innerHTML = '<a href="index.html" class="right-user-dropdown-item">' +
      '<i class="fa-solid fa-right-from-bracket"></i> ログアウト</a>';
    userPanel.appendChild(dropdown);

    // Toggle on click
    userPanel.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });
  }

  // ---- Right Sidebar: P&L Summary ----
  function renderPnlSummary() {
    var container = document.getElementById('rightPnlSummary');
    if (!container || typeof MOCK_PNL_SUMMARY === 'undefined') return;

    var items = [
      { label: '今月の損益', value: MOCK_PNL_SUMMARY.thisMonth.total, href: 'calendar.html' },
      { label: '先月損益', value: MOCK_PNL_SUMMARY.thisYear.total, href: 'report.html' },
      { label: '生涯損益', value: MOCK_PNL_SUMMARY.lifetime.total, href: 'report.html' }
    ];

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

    var data = tab === 'trending' ? MOCK_CMC_TRENDING : MOCK_CMC_TOP5;
    if (typeof data === 'undefined') return;

    var html = '';
    for (var i = 0; i < data.length; i++) {
      var coin = data[i];
      var changeClass = coin.change >= 0 ? 'text-profit' : 'text-loss';
      var changeSign = coin.change >= 0 ? '+' : '';
      var priceStr = coin.price >= 1000 ? formatYen(coin.price).replace('¥', '') : coin.price.toFixed(4);
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
    if (!container || typeof MOCK_ECONOMIC_INDICATORS === 'undefined') return;

    var html = '';
    for (var i = 0; i < MOCK_ECONOMIC_INDICATORS.length; i++) {
      var ind = MOCK_ECONOMIC_INDICATORS[i];
      var actualHtml = ind.actual ? '<span class="right-indicator-val actual">' + ind.actual + '</span>' : '<span class="right-indicator-val">-</span>';
      var stars = ind.importance === 'high' ? '★★★' : ind.importance === 'medium' ? '★★' : '★';
      html += '<div class="right-indicator-item">' +
        '<span class="right-indicator-time">' + ind.time + '</span>' +
        '<span class="right-indicator-country">' + ind.country + '</span>' +
        '<span class="right-indicator-name">' + ind.name + '</span>' +
        '<span class="right-indicator-importance ' + ind.importance + '">' + stars + '</span>' +
        '<div class="right-indicator-values">' +
          actualHtml +
          '<span class="right-indicator-val">' + ind.forecast + '</span>' +
          '<span class="right-indicator-val">' + ind.previous + '</span>' +
        '</div>' +
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
})();
