/**
 * Dashboard - Sidebar profile, P&L cards, activity, clock, mobile sidebar
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderSidebarProfile();
    renderPnlCards();
    renderActivity();
    startClock();
    initMobileSidebar();
  });

  function startClock() {
    var el = document.getElementById('navDatetime');
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
        '<span class="nav-datetime-date">' + y + '/' + m + '/' + d + '(' + w + ')</span>' +
        '<span class="nav-datetime-time">' + hh + '時' + mm + '分' + ss + '秒</span>';
    }

    update();
    setInterval(update, 1000);
  }

  function renderSidebarProfile() {
    // Nav username
    var navName = document.getElementById('navUserName');
    if (navName) navName.textContent = MOCK_USER.name;

    // Sidebar name
    var nameEl = document.getElementById('sidebarName');
    if (nameEl) nameEl.textContent = MOCK_USER.name;

    // Sidebar style badge
    var styleEl = document.getElementById('sidebarStyle');
    if (styleEl) styleEl.textContent = MOCK_USER.style;

    // Sidebar bio
    var bioEl = document.getElementById('sidebarBio');
    if (bioEl) bioEl.textContent = MOCK_USER.bio;

    // Sidebar metrics
    var metricsEl = document.getElementById('sidebarMetrics');
    if (metricsEl) {
      var metrics = [
        { label: 'フォロー', value: MOCK_USER.following },
        { label: 'フォロワー', value: MOCK_USER.followers },
        { label: '投稿数', value: MOCK_USER.posts },
        { label: 'いいね', value: MOCK_USER.likes }
      ];
      var html = '';
      for (var i = 0; i < metrics.length; i++) {
        html += '<div class="sidebar-metric">' +
          '<div class="sidebar-metric-value">' + new Intl.NumberFormat('ja-JP').format(metrics[i].value) + '</div>' +
          '<div class="sidebar-metric-label">' + metrics[i].label + '</div>' +
        '</div>';
      }
      metricsEl.innerHTML = html;
    }
  }

  function renderPnlCards() {
    var container = document.getElementById('pnlCards');
    if (!container) return;

    var cards = [
      {
        label: '今月の損益',
        value: MOCK_PNL_SUMMARY.thisMonth.total,
        sub: '勝ち ' + MOCK_PNL_SUMMARY.thisMonth.winDays + '日 / 負け ' + MOCK_PNL_SUMMARY.thisMonth.lossDays + '日'
      },
      {
        label: '今年の損益',
        value: MOCK_PNL_SUMMARY.thisYear.total,
        sub: '2026年1月〜'
      },
      {
        label: '生涯損益',
        value: MOCK_PNL_SUMMARY.lifetime.total,
        sub: '全期間の累計'
      }
    ];

    var html = '';
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var valueClass = c.value >= 0 ? 'text-profit' : 'text-loss';
      html += '<div class="pnl-card">' +
        '<div class="pnl-card-label">' + c.label + '</div>' +
        '<div class="pnl-card-value ' + valueClass + '">' + formatYen(c.value) + '</div>' +
        '<div class="pnl-card-sub">' + c.sub + '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderActivity() {
    var container = document.getElementById('activityList');
    if (!container) return;

    var html = '';
    for (var i = 0; i < MOCK_ACTIVITY.length; i++) {
      var a = MOCK_ACTIVITY[i];
      var badgeClass = 'badge-primary';
      if (a.typeClass === 'profit') badgeClass = 'badge-profit';
      else if (a.typeClass === 'loss') badgeClass = 'badge-loss';
      else if (a.typeClass === 'accent') badgeClass = 'badge-accent';

      html += '<div class="activity-item">' +
        '<span class="activity-date">' + a.date.replace('2026-', '').replace('-', '/') + '</span>' +
        '<span class="badge activity-type ' + badgeClass + '">' + a.type + '</span>' +
        '<span class="activity-desc">' + a.desc + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function initMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var hamburger = document.querySelector('.hamburger');
    if (!sidebar || !overlay || !hamburger) return;

    hamburger.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }
})();