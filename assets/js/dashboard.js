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
    function applyProfile(user) {
      var name = (user && user.display_name) || (user && user.line_name) || '---';
      var style = (user && user.investment_style) || '';
      var bio = (user && user.bio) || '';

      var navName = document.getElementById('navUserName');
      if (navName) navName.textContent = name;

      var nameEl = document.getElementById('sidebarName');
      if (nameEl) nameEl.textContent = name;

      var styleEl = document.getElementById('sidebarStyle');
      if (styleEl) styleEl.textContent = style;

      var bioEl = document.getElementById('sidebarBio');
      if (bioEl) bioEl.textContent = bio;

      // Metrics (followers etc.) are not yet available from API — hide section
      var metricsEl = document.getElementById('sidebarMetrics');
      if (metricsEl) metricsEl.style.display = 'none';
    }

    // Use REIJI_USER set by auth.js
    if (window.REIJI_USER) {
      applyProfile(window.REIJI_USER);
      return;
    }

    // Poll for REIJI_USER (auth.js sets it asynchronously)
    var pollInterval = setInterval(function () {
      if (window.REIJI_USER) {
        clearInterval(pollInterval);
        applyProfile(window.REIJI_USER);
      }
    }, 50);
    setTimeout(function () {
      clearInterval(pollInterval);
      applyProfile(null);
    }, 5000);
  }

  function renderPnlCards() {
    var container = document.getElementById('pnlCards');
    if (!container) return;

    if (!window.REIJI_IS_LOGGED_IN && !localStorage.getItem('reiji_token')) {
      container.innerHTML = '<div style="text-align:center;padding:2rem 1rem;color:var(--text-tertiary);font-size:var(--text-sm);">ログインすると損益データが表示されます</div>';
      return;
    }

    apiFetch('/api/pnl/summary')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        var now = new Date();
        var cards = [
          {
            label: '今月の損益',
            value: data.month,
            sub: '勝ち ' + data.win_days + '日 / 負け ' + data.loss_days + '日'
          },
          {
            label: '今年の損益',
            value: data.year,
            sub: now.getFullYear() + '年1月〜'
          },
          {
            label: '今日の損益',
            value: data.today,
            sub: now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate()
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
      })
      .catch(function () {
        container.innerHTML = '<div class="pnl-card"><div class="pnl-card-label">データを取得できませんでした</div></div>';
      });
  }

  function renderActivity() {
    var container = document.getElementById('activityList');
    if (!container) return;

    container.innerHTML =
      '<div style="text-align:center;padding:2rem 1rem;color:var(--text-tertiary);">' +
        '<i class="fa-solid fa-clock" style="font-size:1.5rem;margin-bottom:0.5rem;display:block;"></i>' +
        '<div>アクティビティ機能は準備中です</div>' +
      '</div>';
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