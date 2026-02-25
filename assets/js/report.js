/**
 * Report - Monthly, Yearly, and Lifetime views
 * KPI cards, charts, category breakdown, summaries, rankings, goal progress
 * Uses API: GET /api/pnl/report, GET /api/pnl/categories, GET /api/goals
 */
(function () {
  var now = new Date();
  var currentPeriod = 'monthly';
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth() + 1;
  var reportCategories = [];

  document.addEventListener('DOMContentLoaded', function () {
    startClock();
    // Check URL param for initial period
    var urlParams = new URLSearchParams(window.location.search);
    var paramPeriod = urlParams.get('period');
    if (paramPeriod && (paramPeriod === 'monthly' || paramPeriod === 'yearly' || paramPeriod === 'lifetime')) {
      currentPeriod = paramPeriod;
      var tabs = document.querySelectorAll('.report-period-tab');
      tabs.forEach(function (t) {
        t.classList.toggle('active', t.getAttribute('data-period') === currentPeriod);
      });
      if (window._updateSidebarPeriod) window._updateSidebarPeriod(currentPeriod);
    }
    initPeriodTabs();
    initNavigation();
    // Fetch categories first, then render
    apiFetch('/api/pnl/categories')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (cats) { reportCategories = cats; })
      .catch(function () {
        reportCategories = (typeof MOCK_CATEGORIES !== 'undefined') ? MOCK_CATEGORIES : [];
      })
      .then(function () { renderReport(); });
  });

  // Expose period switch for sidebar links
  window._switchReportPeriod = function (period) {
    if (period === currentPeriod) return;
    currentPeriod = period;
    var tabs = document.querySelectorAll('.report-period-tab');
    tabs.forEach(function (t) {
      t.classList.toggle('active', t.getAttribute('data-period') === currentPeriod);
    });
    if (window._updateSidebarPeriod) window._updateSidebarPeriod(currentPeriod);
    renderReport();
  };

  /* ---- Clock ---- */
  function startClock() {
    var el = document.getElementById('navDatetime');
    if (!el) return;

    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    function update() {
      var n = new Date();
      var y = n.getFullYear();
      var m = n.getMonth() + 1;
      var d = n.getDate();
      var w = weekdays[n.getDay()];
      var hh = String(n.getHours()).padStart(2, '0');
      var mm = String(n.getMinutes()).padStart(2, '0');
      var ss = String(n.getSeconds()).padStart(2, '0');

      el.innerHTML =
        '<span class="nav-datetime-date">' + y + '/' + m + '/' + d + '(' + w + ')</span>' +
        '<span class="nav-datetime-time">' + hh + '時' + mm + '分' + ss + '秒</span>';
    }

    update();
    setInterval(update, 1000);
  }

  /* ---- Period Tabs ---- */
  function initPeriodTabs() {
    var tabs = document.querySelectorAll('.report-period-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        currentPeriod = this.getAttribute('data-period');
        if (window._updateSidebarPeriod) window._updateSidebarPeriod(currentPeriod);
        renderReport();
      });
    });
  }

  /* ---- Navigation ---- */
  function initNavigation() {
    document.getElementById('prevPeriod').addEventListener('click', function () {
      if (currentPeriod === 'monthly') {
        currentMonth--;
        if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      } else if (currentPeriod === 'yearly') {
        currentYear--;
      }
      renderReport();
    });

    document.getElementById('nextPeriod').addEventListener('click', function () {
      if (currentPeriod === 'monthly') {
        currentMonth++;
        if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      } else if (currentPeriod === 'yearly') {
        currentYear++;
      }
      renderReport();
    });
  }

  /* ---- Helpers ---- */
  function setTitle(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function showEl(id, visible) {
    var el = document.getElementById(id);
    if (el) el.style.display = visible ? '' : 'none';
  }

  function getCatById(id) {
    for (var i = 0; i < reportCategories.length; i++) {
      if (reportCategories[i].id === id || reportCategories[i].id === String(id)) return reportCategories[i];
    }
    return null;
  }

  /* ---- Main Render Dispatcher ---- */
  function renderReport() {
    var titleEl = document.getElementById('reportTitle');
    var navBtns = document.querySelectorAll('.report-nav-btn');

    if (currentPeriod === 'monthly') {
      titleEl.textContent = currentYear + '年' + currentMonth + '月';
      navBtns.forEach(function (b) { b.style.visibility = 'visible'; });
    } else if (currentPeriod === 'yearly') {
      titleEl.textContent = currentYear + '年';
      navBtns.forEach(function (b) { b.style.visibility = 'visible'; });
    } else {
      titleEl.textContent = '全期間';
      navBtns.forEach(function (b) { b.style.visibility = 'hidden'; });
    }

    var url = '/api/pnl/report?period=' + currentPeriod;
    if (currentPeriod === 'monthly') {
      url += '&year=' + currentYear + '&month=' + currentMonth;
    } else if (currentPeriod === 'yearly') {
      url += '&year=' + currentYear;
    }

    apiFetch(url)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (apiData) {
        if (currentPeriod === 'monthly') {
          renderMonthlyFromApi(apiData);
        } else if (currentPeriod === 'yearly') {
          renderYearlyFromApi(apiData);
        } else {
          renderLifetimeFromApi(apiData);
        }
      })
      .catch(function () {
        // Fallback to mock data
        if (currentPeriod === 'monthly') {
          renderMonthlyMock();
        } else if (currentPeriod === 'yearly') {
          renderYearlyMock();
        } else {
          renderLifetimeMock();
        }
      });
  }

  /* ================================================================
     MONTHLY VIEW (API)
     ================================================================ */
  function renderMonthlyFromApi(apiData) {
    setTitle('chartTitle', '日次損益推移');
    setTitle('summaryTitle', '週別サマリー');
    setTitle('bestTitle', 'ベスト3');
    setTitle('worstTitle', 'ワースト3');
    setTitle('goalTitle', '年間目標への進捗');
    showEl('summarySection', true);
    showEl('goalSection', true);

    // Build data structures from API response
    var data = {};
    var entries = [];
    for (var i = 0; i < apiData.chartData.length; i++) {
      var cd = apiData.chartData[i];
      var day = parseInt(cd.label);
      if (cd.value !== 0) {
        data[day] = { total: cd.value, categories: [], comment: '' };
        entries.push({ day: day, total: cd.value, comment: '' });
      }
    }
    entries.sort(function (a, b) { return a.day - b.day; });

    var kpi = apiData.kpi;
    var stats = {
      totalPnl: kpi.total,
      winDays: kpi.winDays,
      lossDays: kpi.lossDays,
      tradeDays: kpi.tradeDays,
      maxWin: kpi.maxWin,
      maxLoss: kpi.maxLoss,
      avgPnl: kpi.avgDaily,
      winRate: Math.round(kpi.winRate),
      catTotals: apiData.categoryTotals,
      entries: entries
    };

    renderMonthlyKpi(stats);
    renderDailyChart(data, stats);
    renderCategoryBreakdown(stats.catTotals);

    // Weekly summary from API
    var weeklyPnl = apiData.weeklyPnl || {};
    renderWeeklySummaryFromData(weeklyPnl);

    // Best/worst from API
    renderMonthlyBestWorstFromApi(apiData.best3, apiData.worst3);
    renderGoalProgress();
  }

  /* ================================================================
     MONTHLY VIEW (Mock fallback)
     ================================================================ */
  function renderMonthlyMock() {
    var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    var data = (typeof MOCK_CALENDAR !== 'undefined') ? MOCK_CALENDAR[key] || {} : {};
    var stats = calcMonthStats(data);

    setTitle('chartTitle', '日次損益推移');
    setTitle('summaryTitle', '週別サマリー');
    setTitle('bestTitle', 'ベスト3');
    setTitle('worstTitle', 'ワースト3');
    setTitle('goalTitle', '年間目標への進捗');
    showEl('summarySection', true);
    showEl('goalSection', true);

    renderMonthlyKpi(stats);
    renderDailyChart(data, stats);
    renderCategoryBreakdown(stats.catTotals);
    renderWeeklySummary(data);
    renderMonthlyBestWorst(stats);
    renderGoalProgress();
  }

  function calcMonthStats(data) {
    var totalPnl = 0, winDays = 0, lossDays = 0, tradeDays = 0;
    var maxWin = 0, maxLoss = 0;
    var catTotals = {};
    var entries = [];

    for (var d in data) {
      var entry = data[d];
      totalPnl += entry.total;
      tradeDays++;
      if (entry.total > 0) { winDays++; if (entry.total > maxWin) maxWin = entry.total; }
      if (entry.total < 0) { lossDays++; if (entry.total < maxLoss) maxLoss = entry.total; }
      entries.push({ day: parseInt(d), total: entry.total, comment: entry.comment || '' });

      for (var c = 0; c < entry.categories.length; c++) {
        var cat = entry.categories[c];
        if (!catTotals[cat.id]) catTotals[cat.id] = 0;
        catTotals[cat.id] += cat.amount;
      }
    }

    entries.sort(function (a, b) { return a.day - b.day; });

    return {
      totalPnl: totalPnl,
      winDays: winDays,
      lossDays: lossDays,
      tradeDays: tradeDays,
      maxWin: maxWin,
      maxLoss: maxLoss,
      avgPnl: tradeDays > 0 ? Math.round(totalPnl / tradeDays) : 0,
      winRate: tradeDays > 0 ? Math.round((winDays / tradeDays) * 100) : 0,
      catTotals: catTotals,
      entries: entries
    };
  }

  function renderMonthlyKpi(stats) {
    var container = document.getElementById('reportKpi');
    if (!container) return;

    var kpis = [
      { icon: '<i class="fa-solid fa-sack-dollar"></i>', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '月間損益合計', sub: '勝ち ' + stats.winDays + '日 / 負け ' + stats.lossDays + '日' },
      { icon: '<i class="fa-solid fa-bullseye"></i>', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率', sub: stats.tradeDays + '日中 ' + stats.winDays + '勝' },
      { icon: '<i class="fa-solid fa-chart-column"></i>', value: formatYen(stats.avgPnl), cls: stats.avgPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均日次損益', sub: '取引日数 ' + stats.tradeDays + '日' },
      { icon: '<i class="fa-solid fa-bolt"></i>', value: formatYen(stats.maxWin), cls: 'text-profit', label: '最大利益（1日）', sub: '最大損失: ' + formatYen(stats.maxLoss) }
    ];

    renderKpiCards(container, kpis);
  }

  function renderDailyChart(data, stats) {
    var container = document.getElementById('reportChart');
    if (!container) return;

    var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    var entries = stats.entries;

    if (entries.length === 0) {
      container.innerHTML = '<div class="report-cat-empty">この月のデータはありません</div>';
      return;
    }

    var maxAbs = 0;
    for (var i = 0; i < entries.length; i++) {
      var abs = Math.abs(entries[i].total);
      if (abs > maxAbs) maxAbs = abs;
    }
    if (maxAbs === 0) maxAbs = 1;

    var chartHeight = 200;
    var halfHeight = chartHeight / 2;

    var html = '<div class="report-bar-chart" style="height: ' + (chartHeight + 24) + 'px; padding-bottom: 24px;">';
    html += '<div class="report-bar-zero-line"></div>';

    var dataMap = {};
    for (var j = 0; j < entries.length; j++) {
      dataMap[entries[j].day] = entries[j];
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
      var dayClass = dayOfWeek === 0 ? ' sun' : (dayOfWeek === 6 ? ' sat' : '');
      var entry = dataMap[day];

      html += '<div class="report-bar-col">';

      if (entry) {
        var pnlClass = entry.total >= 0 ? 'profit' : 'loss';
        var barPct = Math.round((Math.abs(entry.total) / maxAbs) * halfHeight);
        if (barPct < 2) barPct = 2;

        var tooltipStyle = entry.total >= 0
          ? 'bottom: ' + (halfHeight + barPct + 4) + 'px;'
          : 'top: ' + (halfHeight + barPct + 4) + 'px;';

        html += '<div class="report-bar-tooltip ' + pnlClass + '" style="' + tooltipStyle + '">' + formatYen(entry.total) + '</div>';

        if (entry.total >= 0) {
          html += '<div class="report-bar-upper"><div class="report-bar profit" style="height: ' + barPct + 'px;"></div></div>';
          html += '<div class="report-bar-lower"></div>';
        } else {
          html += '<div class="report-bar-upper"></div>';
          html += '<div class="report-bar-lower"><div class="report-bar loss" style="height: ' + barPct + 'px;"></div></div>';
        }
      } else {
        html += '<div class="report-bar-upper"></div>';
        html += '<div class="report-bar-lower"></div>';
      }

      html += '<span class="report-bar-day' + dayClass + '">' + day + '</span>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderWeeklySummary(data) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    var weeks = [];
    var weekNum = 1;
    var weekStart = 1;

    for (var day = 1; day <= daysInMonth; day++) {
      var dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
      if (dayOfWeek === 6 || day === daysInMonth) {
        weeks.push({ num: weekNum, start: weekStart, end: day });
        weekNum++;
        weekStart = day + 1;
      }
    }

    var html = '';
    for (var w = 0; w < weeks.length; w++) {
      var week = weeks[w];
      var weekTotal = 0;
      var weekTradeDays = 0;

      for (var d = week.start; d <= week.end; d++) {
        if (data[d]) { weekTotal += data[d].total; weekTradeDays++; }
      }

      var amtClass = weekTotal >= 0 ? 'text-profit' : 'text-loss';
      if (weekTotal === 0 && weekTradeDays === 0) amtClass = 'text-muted';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">第' + week.num + '週</div>' +
        '<div class="report-week-dates">' + currentMonth + '/' + week.start + ' - ' + currentMonth + '/' + week.end + '</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + (weekTradeDays > 0 ? formatYen(weekTotal) : '---') + '</div>' +
        '<div class="report-week-days">' + weekTradeDays + '日取引</div></div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderWeeklySummaryFromData(weeklyPnl) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    var weeks = [];
    var weekNum = 1;
    var weekStart = 1;

    for (var day = 1; day <= daysInMonth; day++) {
      var dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
      if (dayOfWeek === 6 || day === daysInMonth) {
        weeks.push({ num: weekNum, start: weekStart, end: day });
        weekNum++;
        weekStart = day + 1;
      }
    }

    var html = '';
    for (var w = 0; w < weeks.length; w++) {
      var week = weeks[w];
      var weekTotal = weeklyPnl[week.num] || 0;
      var hasData = weeklyPnl[week.num] !== undefined;

      var amtClass = weekTotal >= 0 ? 'text-profit' : 'text-loss';
      if (!hasData) amtClass = 'text-muted';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">第' + week.num + '週</div>' +
        '<div class="report-week-dates">' + currentMonth + '/' + week.start + ' - ' + currentMonth + '/' + week.end + '</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + (hasData ? formatYen(weekTotal) : '---') + '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderMonthlyBestWorst(stats) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var entries = stats.entries.slice();
    var rankClasses = ['gold', 'silver', 'bronze'];

    var best = entries.filter(function (e) { return e.total > 0; })
      .sort(function (a, b) { return b.total - a.total; }).slice(0, 3);
    var worst = entries.filter(function (e) { return e.total < 0; })
      .sort(function (a, b) { return a.total - b.total; }).slice(0, 3);

    renderBestWorstDays(bestContainer, best, rankClasses, 'profit', '利益日がありません');
    renderBestWorstDays(worstContainer, worst, rankClasses, 'loss', '損失日がありません');
  }

  function renderMonthlyBestWorstFromApi(best3, worst3) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var rankClasses = ['gold', 'silver', 'bronze'];

    // Convert API {day: amount} to sorted entries
    var best = objectToEntries(best3, true);
    var worst = objectToEntries(worst3, false);

    renderBestWorstDays(bestContainer, best, rankClasses, 'profit', '利益日がありません');
    renderBestWorstDays(worstContainer, worst, rankClasses, 'loss', '損失日がありません');
  }

  function objectToEntries(obj, descending) {
    var entries = [];
    for (var key in obj) {
      entries.push({ day: parseInt(key), total: obj[key], comment: '' });
    }
    entries.sort(function (a, b) {
      return descending ? b.total - a.total : a.total - b.total;
    });
    return entries.slice(0, 3);
  }

  function renderBestWorstDays(container, items, rankClasses, type, emptyText) {
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="report-rank-empty">' + emptyText + '</div>';
      return;
    }

    var textClass = type === 'profit' ? 'text-profit' : 'text-loss';
    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="report-rank-item">' +
        '<span class="report-rank-num ' + rankClasses[i] + '">' + (i + 1) + '</span>' +
        '<span class="report-rank-date">' + currentMonth + '/' + items[i].day + '</span>' +
        '<span class="report-rank-comment">' + (items[i].comment || '') + '</span>' +
        '<span class="report-rank-amount ' + textClass + '">' + formatYen(items[i].total) + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  /* ================================================================
     YEARLY VIEW (API)
     ================================================================ */
  function renderYearlyFromApi(apiData) {
    setTitle('chartTitle', '月次損益推移');
    setTitle('summaryTitle', '四半期サマリー');
    setTitle('bestTitle', 'ベスト3（月）');
    setTitle('worstTitle', 'ワースト3（月）');
    setTitle('goalTitle', '年間目標への進捗');
    showEl('summarySection', true);
    showEl('goalSection', true);

    var kpi = apiData.kpi;
    var monthlyEntries = [];
    for (var i = 0; i < apiData.chartData.length; i++) {
      var cd = apiData.chartData[i];
      var m = parseInt(cd.label);
      monthlyEntries.push({ label: m + '月', total: cd.value, tradeDays: 0, month: m });
    }

    var activeEntries = monthlyEntries.filter(function (e) { return e.total !== 0; });
    var lossMonths = activeEntries.filter(function (e) { return e.total < 0; }).length;

    var stats = {
      totalPnl: kpi.total,
      winDays: kpi.winDays || 0,
      lossDays: (kpi.tradeDays || 0) - (kpi.winDays || 0),
      tradeDays: kpi.tradeDays || 0,
      winMonths: kpi.winMonths || 0,
      lossMonths: lossMonths,
      activeMonths: kpi.totalMonths || activeEntries.length,
      avgMonthPnl: kpi.avgMonthly || 0,
      maxWin: kpi.maxWin || 0,
      maxLoss: kpi.maxLoss || 0,
      winRate: Math.round(kpi.winRate || 0),
      catTotals: apiData.categoryTotals,
      monthlyEntries: monthlyEntries
    };

    renderYearlyKpi(stats);
    renderMonthlyChart(stats);
    renderCategoryBreakdown(stats.catTotals);

    // Quarterly summary from API
    var quarterlyPnl = apiData.quarterlyPnl || {};
    renderQuarterlySummaryFromApi(quarterlyPnl);

    // Best/worst months from API
    renderBestWorstMonthsFromApi(apiData.best3, apiData.worst3);
    renderGoalProgress();
  }

  /* ================================================================
     YEARLY VIEW (Mock fallback)
     ================================================================ */
  function renderYearlyMock() {
    var stats = calcYearStats(currentYear);

    setTitle('chartTitle', '月次損益推移');
    setTitle('summaryTitle', '四半期サマリー');
    setTitle('bestTitle', 'ベスト3（月）');
    setTitle('worstTitle', 'ワースト3（月）');
    setTitle('goalTitle', '年間目標への進捗');
    showEl('summarySection', true);
    showEl('goalSection', true);

    renderYearlyKpi(stats);
    renderMonthlyChart(stats);
    renderCategoryBreakdown(stats.catTotals);
    renderQuarterlySummary(stats);
    renderBestWorstEntries(stats.monthlyEntries);
    renderGoalProgress();
  }

  function calcYearStats(year) {
    var totalPnl = 0, winDays = 0, lossDays = 0, tradeDays = 0;
    var catTotals = {};
    var monthlyEntries = [];

    for (var m = 1; m <= 12; m++) {
      var key = year + '-' + String(m).padStart(2, '0');
      var data = (typeof MOCK_CALENDAR !== 'undefined') ? MOCK_CALENDAR[key] : null;
      if (!data) continue;

      var monthTotal = 0, mTrade = 0;
      for (var d in data) {
        var entry = data[d];
        monthTotal += entry.total;
        tradeDays++;
        mTrade++;
        if (entry.total > 0) winDays++;
        if (entry.total < 0) lossDays++;

        for (var c = 0; c < entry.categories.length; c++) {
          var cat = entry.categories[c];
          if (!catTotals[cat.id]) catTotals[cat.id] = 0;
          catTotals[cat.id] += cat.amount;
        }
      }

      totalPnl += monthTotal;
      monthlyEntries.push({ label: m + '月', total: monthTotal, tradeDays: mTrade, month: m });
    }

    var activeMonths = monthlyEntries.length;
    var winMonths = monthlyEntries.filter(function (e) { return e.total > 0; }).length;
    var lossMonths = monthlyEntries.filter(function (e) { return e.total < 0; }).length;
    var maxWin = 0, maxLoss = 0;
    monthlyEntries.forEach(function (e) {
      if (e.total > maxWin) maxWin = e.total;
      if (e.total < maxLoss) maxLoss = e.total;
    });

    return {
      totalPnl: totalPnl,
      winDays: winDays,
      lossDays: lossDays,
      tradeDays: tradeDays,
      winMonths: winMonths,
      lossMonths: lossMonths,
      activeMonths: activeMonths,
      avgMonthPnl: activeMonths > 0 ? Math.round(totalPnl / activeMonths) : 0,
      maxWin: maxWin,
      maxLoss: maxLoss,
      winRate: tradeDays > 0 ? Math.round((winDays / tradeDays) * 100) : 0,
      catTotals: catTotals,
      monthlyEntries: monthlyEntries
    };
  }

  function renderYearlyKpi(stats) {
    var container = document.getElementById('reportKpi');
    if (!container) return;

    var kpis = [
      { icon: '<i class="fa-solid fa-sack-dollar"></i>', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '年間損益合計', sub: '黒字 ' + stats.winMonths + '月 / 赤字 ' + stats.lossMonths + '月' },
      { icon: '<i class="fa-solid fa-bullseye"></i>', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率（日）', sub: stats.tradeDays + '日中 ' + stats.winDays + '勝' },
      { icon: '<i class="fa-solid fa-chart-column"></i>', value: formatYen(stats.avgMonthPnl), cls: stats.avgMonthPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均月間損益', sub: '取引月数 ' + stats.activeMonths + '月' },
      { icon: '<i class="fa-solid fa-bolt"></i>', value: formatYen(stats.maxWin), cls: 'text-profit', label: '最大利益（1月）', sub: '最大損失: ' + formatYen(stats.maxLoss) }
    ];

    renderKpiCards(container, kpis);
  }

  function renderMonthlyChart(stats) {
    var container = document.getElementById('reportChart');
    if (!container) return;

    var entries = stats.monthlyEntries;
    if (entries.length === 0) {
      container.innerHTML = '<div class="report-cat-empty">この年のデータはありません</div>';
      return;
    }

    var maxAbs = 0;
    entries.forEach(function (e) {
      var abs = Math.abs(e.total);
      if (abs > maxAbs) maxAbs = abs;
    });
    if (maxAbs === 0) maxAbs = 1;

    var chartHeight = 200;
    var halfHeight = chartHeight / 2;

    var html = '<div class="report-bar-chart" style="height: ' + (chartHeight + 24) + 'px; padding-bottom: 24px;">';
    html += '<div class="report-bar-zero-line"></div>';

    var monthMap = {};
    entries.forEach(function (e) { monthMap[e.month] = e; });

    for (var m = 1; m <= 12; m++) {
      var entry = monthMap[m];
      html += '<div class="report-bar-col">';

      if (entry && entry.total !== 0) {
        var pnlClass = entry.total >= 0 ? 'profit' : 'loss';
        var barPct = Math.round((Math.abs(entry.total) / maxAbs) * halfHeight);
        if (barPct < 2) barPct = 2;

        var tooltipStyle = entry.total >= 0
          ? 'bottom: ' + (halfHeight + barPct + 4) + 'px;'
          : 'top: ' + (halfHeight + barPct + 4) + 'px;';

        html += '<div class="report-bar-tooltip ' + pnlClass + '" style="' + tooltipStyle + '">' + formatYen(entry.total) + '</div>';

        if (entry.total >= 0) {
          html += '<div class="report-bar-upper"><div class="report-bar profit" style="height: ' + barPct + 'px;"></div></div>';
          html += '<div class="report-bar-lower"></div>';
        } else {
          html += '<div class="report-bar-upper"></div>';
          html += '<div class="report-bar-lower"><div class="report-bar loss" style="height: ' + barPct + 'px;"></div></div>';
        }
      } else {
        html += '<div class="report-bar-upper"></div>';
        html += '<div class="report-bar-lower"></div>';
      }

      html += '<span class="report-bar-day">' + m + '月</span>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderQuarterlySummary(stats) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var quarters = [
      { name: 'Q1（1-3月）', months: [1, 2, 3] },
      { name: 'Q2（4-6月）', months: [4, 5, 6] },
      { name: 'Q3（7-9月）', months: [7, 8, 9] },
      { name: 'Q4（10-12月）', months: [10, 11, 12] }
    ];

    var monthMap = {};
    stats.monthlyEntries.forEach(function (e) { monthMap[e.month] = e; });

    var html = '';
    for (var q = 0; q < quarters.length; q++) {
      var quarter = quarters[q];
      var qTotal = 0;
      var qTradeDays = 0;
      var qMonths = 0;

      for (var i = 0; i < quarter.months.length; i++) {
        var me = monthMap[quarter.months[i]];
        if (me) { qTotal += me.total; qTradeDays += me.tradeDays; qMonths++; }
      }

      var amtClass = qTotal >= 0 ? 'text-profit' : 'text-loss';
      if (qTotal === 0 && qMonths === 0) amtClass = 'text-muted';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">' + quarter.name + '</div>' +
        '<div class="report-week-dates">' + qMonths + 'ヶ月分データ</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + (qMonths > 0 ? formatYen(qTotal) : '---') + '</div>' +
        '<div class="report-week-days">' + qTradeDays + '日取引</div></div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderQuarterlySummaryFromApi(quarterlyPnl) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var quarters = [
      { name: 'Q1（1-3月）', key: 1 },
      { name: 'Q2（4-6月）', key: 2 },
      { name: 'Q3（7-9月）', key: 3 },
      { name: 'Q4（10-12月）', key: 4 }
    ];

    var html = '';
    for (var q = 0; q < quarters.length; q++) {
      var quarter = quarters[q];
      var qTotal = quarterlyPnl[quarter.key] || 0;
      var hasData = quarterlyPnl[quarter.key] !== undefined;

      var amtClass = qTotal >= 0 ? 'text-profit' : 'text-loss';
      if (!hasData) amtClass = 'text-muted';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">' + quarter.name + '</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + (hasData ? formatYen(qTotal) : '---') + '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderBestWorstMonthsFromApi(best3, worst3) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var rankClasses = ['gold', 'silver', 'bronze'];

    var best = [];
    for (var bk in best3) {
      best.push({ label: parseInt(bk) + '月', total: best3[bk], tradeDays: 0 });
    }
    best.sort(function (a, b) { return b.total - a.total; });

    var worst = [];
    for (var wk in worst3) {
      worst.push({ label: parseInt(wk) + '月', total: worst3[wk], tradeDays: 0 });
    }
    worst.sort(function (a, b) { return a.total - b.total; });

    renderBestWorstLabeled(bestContainer, best.slice(0, 3), rankClasses, 'text-profit', '利益月がありません');
    renderBestWorstLabeled(worstContainer, worst.slice(0, 3), rankClasses, 'text-loss', '損失月がありません');
  }

  /* ================================================================
     LIFETIME VIEW (API)
     ================================================================ */
  function renderLifetimeFromApi(apiData) {
    setTitle('chartTitle', '月次損益推移（全期間）');
    setTitle('summaryTitle', '年別サマリー');
    setTitle('bestTitle', 'ベスト3（月）');
    setTitle('worstTitle', 'ワースト3（月）');
    showEl('summarySection', true);
    showEl('goalSection', false);

    var kpi = apiData.kpi;
    var monthlyEntries = [];
    for (var i = 0; i < apiData.chartData.length; i++) {
      var cd = apiData.chartData[i];
      var parts = cd.label.split('/');
      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      monthlyEntries.push({
        label: year + '年' + month + '月',
        total: cd.value,
        tradeDays: 0,
        key: year + '-' + String(month).padStart(2, '0'),
        year: year,
        month: month
      });
    }

    var winMonths = monthlyEntries.filter(function (e) { return e.total > 0; }).length;
    var lossMonths = monthlyEntries.filter(function (e) { return e.total < 0; }).length;

    var stats = {
      totalPnl: kpi.total,
      winDays: 0,
      lossDays: 0,
      tradeDays: kpi.tradeDays || 0,
      activeMonths: kpi.totalMonths || monthlyEntries.length,
      avgMonthPnl: kpi.avgMonthly || 0,
      winRate: Math.round(kpi.winRate || 0),
      catTotals: apiData.categoryTotals,
      monthlyEntries: monthlyEntries,
      yearTotals: apiData.yearlyPnl || {}
    };

    renderLifetimeKpi(stats, winMonths, lossMonths);
    renderLifetimeChart(stats);
    renderCategoryBreakdown(stats.catTotals);

    // Yearly summary from API
    renderYearlySummaryFromApi(apiData.yearlyPnl || {});

    // Best/worst months from API
    renderBestWorstLifetimeFromApi(apiData.best3, apiData.worst3);
  }

  /* ================================================================
     LIFETIME VIEW (Mock fallback)
     ================================================================ */
  function renderLifetimeMock() {
    var stats = calcLifetimeStats();

    setTitle('chartTitle', '月次損益推移（全期間）');
    setTitle('summaryTitle', '年別サマリー');
    setTitle('bestTitle', 'ベスト3（月）');
    setTitle('worstTitle', 'ワースト3（月）');
    showEl('summarySection', true);
    showEl('goalSection', false);

    var winMonths = stats.monthlyEntries.filter(function (e) { return e.total > 0; }).length;
    var lossMonths = stats.monthlyEntries.filter(function (e) { return e.total < 0; }).length;

    renderLifetimeKpi(stats, winMonths, lossMonths);
    renderLifetimeChart(stats);
    renderCategoryBreakdown(stats.catTotals);
    renderYearlySummary(stats);
    renderBestWorstEntries(stats.monthlyEntries);
  }

  function calcLifetimeStats() {
    var allKeys = (typeof MOCK_CALENDAR !== 'undefined') ? Object.keys(MOCK_CALENDAR).sort() : [];
    var totalPnl = 0, winDays = 0, lossDays = 0, tradeDays = 0;
    var catTotals = {};
    var monthlyEntries = [];
    var yearTotals = {};

    for (var k = 0; k < allKeys.length; k++) {
      var key = allKeys[k];
      var parts = key.split('-');
      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      var data = MOCK_CALENDAR[key];

      var monthTotal = 0, mTrade = 0;
      for (var d in data) {
        var entry = data[d];
        monthTotal += entry.total;
        tradeDays++;
        mTrade++;
        if (entry.total > 0) winDays++;
        if (entry.total < 0) lossDays++;

        for (var c = 0; c < entry.categories.length; c++) {
          var cat = entry.categories[c];
          if (!catTotals[cat.id]) catTotals[cat.id] = 0;
          catTotals[cat.id] += cat.amount;
        }
      }

      totalPnl += monthTotal;
      monthlyEntries.push({
        label: year + '年' + month + '月',
        total: monthTotal,
        tradeDays: mTrade,
        key: key,
        year: year,
        month: month
      });

      if (!yearTotals[year]) yearTotals[year] = { total: 0, tradeDays: 0, months: 0 };
      yearTotals[year].total += monthTotal;
      yearTotals[year].tradeDays += mTrade;
      yearTotals[year].months++;
    }

    var activeMonths = monthlyEntries.length;

    return {
      totalPnl: totalPnl,
      winDays: winDays,
      lossDays: lossDays,
      tradeDays: tradeDays,
      activeMonths: activeMonths,
      avgMonthPnl: activeMonths > 0 ? Math.round(totalPnl / activeMonths) : 0,
      winRate: tradeDays > 0 ? Math.round((winDays / tradeDays) * 100) : 0,
      catTotals: catTotals,
      monthlyEntries: monthlyEntries,
      yearTotals: yearTotals
    };
  }

  function renderLifetimeKpi(stats, winMonths, lossMonths) {
    var container = document.getElementById('reportKpi');
    if (!container) return;

    var kpis = [
      { icon: '<i class="fa-solid fa-sack-dollar"></i>', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '生涯損益合計', sub: stats.activeMonths + 'ヶ月間の記録' },
      { icon: '<i class="fa-solid fa-bullseye"></i>', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率（日）', sub: stats.tradeDays + '日中' },
      { icon: '<i class="fa-solid fa-chart-column"></i>', value: formatYen(stats.avgMonthPnl), cls: stats.avgMonthPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均月間損益', sub: '黒字月 ' + winMonths + ' / 赤字月 ' + lossMonths },
      { icon: '<i class="fa-solid fa-bolt"></i>', value: stats.tradeDays + '日', cls: '', label: '総取引日数', sub: stats.activeMonths + 'ヶ月' }
    ];

    renderKpiCards(container, kpis);
  }

  function renderLifetimeChart(stats) {
    var container = document.getElementById('reportChart');
    if (!container) return;

    var entries = stats.monthlyEntries;
    if (entries.length === 0) {
      container.innerHTML = '<div class="report-cat-empty">データがありません</div>';
      return;
    }

    var maxAbs = 0;
    entries.forEach(function (e) {
      var abs = Math.abs(e.total);
      if (abs > maxAbs) maxAbs = abs;
    });
    if (maxAbs === 0) maxAbs = 1;

    var chartHeight = 200;
    var halfHeight = chartHeight / 2;

    var html = '<div class="report-bar-chart" style="height: ' + (chartHeight + 24) + 'px; padding-bottom: 24px;">';
    html += '<div class="report-bar-zero-line"></div>';

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var pnlClass = entry.total >= 0 ? 'profit' : 'loss';
      var barPct = Math.round((Math.abs(entry.total) / maxAbs) * halfHeight);
      if (barPct < 2 && entry.total !== 0) barPct = 2;

      var tooltipStyle = entry.total >= 0
        ? 'bottom: ' + (halfHeight + barPct + 4) + 'px;'
        : 'top: ' + (halfHeight + barPct + 4) + 'px;';

      html += '<div class="report-bar-col">';

      if (entry.total !== 0) {
        html += '<div class="report-bar-tooltip ' + pnlClass + '" style="' + tooltipStyle + '">' + formatYen(entry.total) + '</div>';

        if (entry.total >= 0) {
          html += '<div class="report-bar-upper"><div class="report-bar profit" style="height: ' + barPct + 'px;"></div></div>';
          html += '<div class="report-bar-lower"></div>';
        } else {
          html += '<div class="report-bar-upper"></div>';
          html += '<div class="report-bar-lower"><div class="report-bar loss" style="height: ' + barPct + 'px;"></div></div>';
        }
      } else {
        html += '<div class="report-bar-upper"></div>';
        html += '<div class="report-bar-lower"></div>';
      }

      // Short label
      var shortLabel = entry.year ? String(entry.year).substring(2) + '/' + entry.month : entry.label;
      html += '<span class="report-bar-day">' + shortLabel + '</span>';
      html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
  }

  function renderYearlySummary(stats) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var yearTotals = stats.yearTotals;
    var years = Object.keys(yearTotals).sort();

    if (years.length === 0) {
      container.innerHTML = '<div class="report-cat-empty">データがありません</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < years.length; i++) {
      var year = years[i];
      var yt = yearTotals[year];
      var amtClass = yt.total >= 0 ? 'text-profit' : 'text-loss';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">' + year + '年</div>' +
        '<div class="report-week-dates">' + yt.months + 'ヶ月分データ</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + formatYen(yt.total) + '</div>' +
        '<div class="report-week-days">' + yt.tradeDays + '日取引</div></div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderYearlySummaryFromApi(yearlyPnl) {
    var container = document.getElementById('reportSummary');
    if (!container) return;

    var years = Object.keys(yearlyPnl).sort();

    if (years.length === 0) {
      container.innerHTML = '<div class="report-cat-empty">データがありません</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < years.length; i++) {
      var year = years[i];
      var total = yearlyPnl[year];
      var amtClass = total >= 0 ? 'text-profit' : 'text-loss';

      html += '<div class="report-week-item">' +
        '<div><div class="report-week-label">' + year + '年</div></div>' +
        '<div style="text-align: right;"><div class="report-week-amount ' + amtClass + '">' + formatYen(total) + '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderBestWorstLifetimeFromApi(best3, worst3) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var rankClasses = ['gold', 'silver', 'bronze'];

    var best = [];
    for (var bk in best3) {
      var bParts = bk.split('-');
      var bLabel = bParts.length === 2
        ? parseInt(bParts[0]) + '年' + parseInt(bParts[1]) + '月'
        : bk + '月';
      best.push({ label: bLabel, total: best3[bk], tradeDays: 0 });
    }
    best.sort(function (a, b) { return b.total - a.total; });

    var worst = [];
    for (var wk in worst3) {
      var wParts = wk.split('-');
      var wLabel = wParts.length === 2
        ? parseInt(wParts[0]) + '年' + parseInt(wParts[1]) + '月'
        : wk + '月';
      worst.push({ label: wLabel, total: worst3[wk], tradeDays: 0 });
    }
    worst.sort(function (a, b) { return a.total - b.total; });

    renderBestWorstLabeled(bestContainer, best.slice(0, 3), rankClasses, 'text-profit', '利益月がありません');
    renderBestWorstLabeled(worstContainer, worst.slice(0, 3), rankClasses, 'text-loss', '損失月がありません');
  }

  /* ================================================================
     SHARED RENDERING
     ================================================================ */
  function renderKpiCards(container, kpis) {
    var html = '';
    for (var i = 0; i < kpis.length; i++) {
      var k = kpis[i];
      html += '<div class="report-kpi">' +
        '<div class="report-kpi-icon">' + k.icon + '</div>' +
        '<div class="report-kpi-value ' + k.cls + '">' + k.value + '</div>' +
        '<div class="report-kpi-label">' + k.label + '</div>' +
        '<div class="report-kpi-sub">' + k.sub + '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderCategoryBreakdown(catTotals) {
    var container = document.getElementById('categoryBreakdown');
    if (!container) return;

    var hasData = false;
    var maxAbs = 0;
    for (var id in catTotals) {
      var abs = Math.abs(catTotals[id]);
      if (abs > maxAbs) maxAbs = abs;
      hasData = true;
    }

    if (!hasData) {
      container.innerHTML = '<div class="report-cat-empty">データがありません</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < reportCategories.length; i++) {
      var mc = reportCategories[i];
      var amount = catTotals[mc.id] || 0;
      if (amount === 0) continue;

      var amtClass = amount >= 0 ? 'text-profit' : 'text-loss';
      var barPct = maxAbs > 0 ? Math.round((Math.abs(amount) / maxAbs) * 100) : 0;
      var color = mc.color || '#888';

      html += '<div class="report-cat-item">' +
        '<span class="report-cat-dot" style="background: ' + color + ';"></span>' +
        '<span class="report-cat-name">' + mc.name + '</span>' +
        '<div class="report-cat-bar-track"><div class="report-cat-bar-fill" style="width: ' + barPct + '%; background: ' + color + ';"></div></div>' +
        '<span class="report-cat-amount ' + amtClass + '">' + formatYen(amount) + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderBestWorstEntries(entries) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var rankClasses = ['gold', 'silver', 'bronze'];

    var best = entries.filter(function (e) { return e.total > 0; })
      .sort(function (a, b) { return b.total - a.total; }).slice(0, 3);
    var worst = entries.filter(function (e) { return e.total < 0; })
      .sort(function (a, b) { return a.total - b.total; }).slice(0, 3);

    renderBestWorstLabeled(bestContainer, best, rankClasses, 'text-profit', '利益月がありません');
    renderBestWorstLabeled(worstContainer, worst, rankClasses, 'text-loss', '損失月がありません');
  }

  function renderBestWorstLabeled(container, items, rankClasses, textClass, emptyText) {
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="report-rank-empty">' + emptyText + '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < items.length; i++) {
      html += '<div class="report-rank-item">' +
        '<span class="report-rank-num ' + rankClasses[i] + '">' + (i + 1) + '</span>' +
        '<span class="report-rank-date">' + items[i].label + '</span>' +
        '<span class="report-rank-comment">' + (items[i].tradeDays ? items[i].tradeDays + '日取引' : '') + '</span>' +
        '<span class="report-rank-amount ' + textClass + '">' + formatYen(items[i].total) + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function renderGoalProgress() {
    var container = document.getElementById('goalProgress');
    if (!container) return;

    // Fetch goal and year total from API
    Promise.all([
      apiFetch('/api/goals?year=' + currentYear).then(function (res) { return res.ok ? res.json() : Promise.reject(); }),
      apiFetch('/api/pnl/report?period=yearly&year=' + currentYear).then(function (res) { return res.ok ? res.json() : Promise.reject(); })
    ])
    .then(function (results) {
      var goalData = results[0];
      var yearData = results[1];
      var yearlyGoal = goalData.amount || 0;
      var yearTotal = yearData.kpi ? yearData.kpi.total : 0;
      renderGoalHtml(container, yearlyGoal, yearTotal);
    })
    .catch(function () {
      // Fallback to mock
      var yearlyGoal = (typeof MOCK_USER !== 'undefined') ? MOCK_USER.yearlyGoal : 0;
      var yearTotal = 0;
      if (typeof MOCK_CALENDAR !== 'undefined') {
        for (var m = 1; m <= 12; m++) {
          var key = currentYear + '-' + String(m).padStart(2, '0');
          var monthData = MOCK_CALENDAR[key];
          if (monthData) {
            for (var d in monthData) {
              yearTotal += monthData[d].total;
            }
          }
        }
      }
      renderGoalHtml(container, yearlyGoal, yearTotal);
    });
  }

  function renderGoalHtml(container, yearlyGoal, yearTotal) {
    if (!yearlyGoal || yearlyGoal <= 0) {
      container.innerHTML = '<div class="report-goal"><div class="report-cat-empty">年間目標が設定されていません</div></div>';
      return;
    }

    var pct = yearlyGoal > 0 ? Math.min(Math.round((yearTotal / yearlyGoal) * 100), 100) : 0;
    if (yearTotal < 0) pct = 0;

    var remaining = yearlyGoal - yearTotal;
    var n = new Date();
    var remainingMonths = currentYear === n.getFullYear() ? (12 - (n.getMonth() + 1)) : (currentYear > n.getFullYear() ? 12 : 0);
    var monthlyNeeded = remainingMonths > 0 ? Math.round(remaining / remainingMonths) : remaining;

    var currentClass = yearTotal >= 0 ? 'text-profit' : 'text-loss';

    container.innerHTML = '<div class="report-goal">' +
      '<div class="report-goal-header">' +
        '<div class="report-goal-current ' + currentClass + '">' + formatYen(yearTotal) + '</div>' +
        '<div class="report-goal-target">目標: <span>' + new Intl.NumberFormat('ja-JP').format(yearlyGoal) + '円</span></div>' +
      '</div>' +
      '<div class="report-goal-bar-track"><div class="report-goal-bar-fill" style="width: ' + pct + '%;"></div></div>' +
      '<div class="report-goal-stats">' +
        '<div>達成率 <span>' + pct + '%</span></div>' +
        '<div>残り <span>' + new Intl.NumberFormat('ja-JP').format(Math.max(remaining, 0)) + '円</span></div>' +
        (remainingMonths > 0 ? '<div>月平均必要額 <span>' + new Intl.NumberFormat('ja-JP').format(Math.max(monthlyNeeded, 0)) + '円</span></div>' : '') +
      '</div>' +
    '</div>';
  }
})();
