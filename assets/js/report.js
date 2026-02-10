/**
 * Report - Monthly, Yearly, and Lifetime views
 * KPI cards, charts, category breakdown, summaries, rankings, goal progress
 */
(function () {
  var currentPeriod = 'monthly';
  var currentYear = 2026;
  var currentMonth = 2;

  document.addEventListener('DOMContentLoaded', function () {
    startClock();
    // Check URL param for initial period (e.g. report.html?period=yearly)
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
    renderReport();
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

  /* ---- Main Render Dispatcher ---- */
  function renderReport() {
    var titleEl = document.getElementById('reportTitle');
    var navBtns = document.querySelectorAll('.report-nav-btn');

    if (currentPeriod === 'monthly') {
      titleEl.textContent = currentYear + '年' + currentMonth + '月';
      navBtns.forEach(function (b) { b.style.visibility = 'visible'; });
      renderMonthly();
    } else if (currentPeriod === 'yearly') {
      titleEl.textContent = currentYear + '年';
      navBtns.forEach(function (b) { b.style.visibility = 'visible'; });
      renderYearly();
    } else {
      titleEl.textContent = '全期間';
      navBtns.forEach(function (b) { b.style.visibility = 'hidden'; });
      renderLifetime();
    }
  }

  /* ================================================================
     MONTHLY VIEW
     ================================================================ */
  function renderMonthly() {
    var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    var data = MOCK_CALENDAR[key] || {};
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
      { icon: '&#128176;', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '月間損益合計', sub: '勝ち ' + stats.winDays + '日 / 負け ' + stats.lossDays + '日' },
      { icon: '&#127919;', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率', sub: stats.tradeDays + '日中 ' + stats.winDays + '勝' },
      { icon: '&#128200;', value: formatYen(stats.avgPnl), cls: stats.avgPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均日次損益', sub: '取引日数 ' + stats.tradeDays + '日' },
      { icon: '&#9889;', value: formatYen(stats.maxWin), cls: 'text-profit', label: '最大利益（1日）', sub: '最大損失: ' + formatYen(stats.maxLoss) }
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

  function renderMonthlyBestWorst(stats) {
    var bestContainer = document.getElementById('bestItems');
    var worstContainer = document.getElementById('worstItems');
    var entries = stats.entries.slice();
    var rankClasses = ['gold', 'silver', 'bronze'];

    var best = entries.filter(function (e) { return e.total > 0; })
      .sort(function (a, b) { return b.total - a.total; }).slice(0, 3);
    var worst = entries.filter(function (e) { return e.total < 0; })
      .sort(function (a, b) { return a.total - b.total; }).slice(0, 3);

    if (bestContainer) {
      if (best.length === 0) {
        bestContainer.innerHTML = '<div class="report-rank-empty">利益日がありません</div>';
      } else {
        var html = '';
        for (var i = 0; i < best.length; i++) {
          html += '<div class="report-rank-item">' +
            '<span class="report-rank-num ' + rankClasses[i] + '">' + (i + 1) + '</span>' +
            '<span class="report-rank-date">' + currentMonth + '/' + best[i].day + '</span>' +
            '<span class="report-rank-comment">' + (best[i].comment || '') + '</span>' +
            '<span class="report-rank-amount text-profit">' + formatYen(best[i].total) + '</span>' +
          '</div>';
        }
        bestContainer.innerHTML = html;
      }
    }

    if (worstContainer) {
      if (worst.length === 0) {
        worstContainer.innerHTML = '<div class="report-rank-empty">損失日がありません</div>';
      } else {
        var html2 = '';
        for (var j = 0; j < worst.length; j++) {
          html2 += '<div class="report-rank-item">' +
            '<span class="report-rank-num ' + rankClasses[j] + '">' + (j + 1) + '</span>' +
            '<span class="report-rank-date">' + currentMonth + '/' + worst[j].day + '</span>' +
            '<span class="report-rank-comment">' + (worst[j].comment || '') + '</span>' +
            '<span class="report-rank-amount text-loss">' + formatYen(worst[j].total) + '</span>' +
          '</div>';
        }
        worstContainer.innerHTML = html2;
      }
    }
  }

  /* ================================================================
     YEARLY VIEW
     ================================================================ */
  function renderYearly() {
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
      var data = MOCK_CALENDAR[key];
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
      { icon: '&#128176;', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '年間損益合計', sub: '黒字 ' + stats.winMonths + '月 / 赤字 ' + stats.lossMonths + '月' },
      { icon: '&#127919;', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率（日）', sub: stats.tradeDays + '日中 ' + stats.winDays + '勝' },
      { icon: '&#128200;', value: formatYen(stats.avgMonthPnl), cls: stats.avgMonthPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均月間損益', sub: '取引月数 ' + stats.activeMonths + '月' },
      { icon: '&#9889;', value: formatYen(stats.maxWin), cls: 'text-profit', label: '最大利益（1月）', sub: '最大損失: ' + formatYen(stats.maxLoss) }
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

  /* ================================================================
     LIFETIME VIEW
     ================================================================ */
  function renderLifetime() {
    var stats = calcLifetimeStats();

    setTitle('chartTitle', '月次損益推移（全期間）');
    setTitle('summaryTitle', '年別サマリー');
    setTitle('bestTitle', 'ベスト3（月）');
    setTitle('worstTitle', 'ワースト3（月）');
    showEl('summarySection', true);
    showEl('goalSection', false);

    renderLifetimeKpi(stats);
    renderLifetimeChart(stats);
    renderCategoryBreakdown(stats.catTotals);
    renderYearlySummary(stats);
    renderBestWorstEntries(stats.monthlyEntries);
  }

  function calcLifetimeStats() {
    var allKeys = Object.keys(MOCK_CALENDAR).sort();
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

  function renderLifetimeKpi(stats) {
    var container = document.getElementById('reportKpi');
    if (!container) return;

    var winMonths = stats.monthlyEntries.filter(function (e) { return e.total > 0; }).length;
    var lossMonths = stats.monthlyEntries.filter(function (e) { return e.total < 0; }).length;

    var kpis = [
      { icon: '&#128176;', value: formatYen(stats.totalPnl), cls: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss', label: '生涯損益合計', sub: stats.activeMonths + 'ヶ月間の記録' },
      { icon: '&#127919;', value: stats.winRate + '%', cls: stats.winRate >= 50 ? 'text-profit' : 'text-loss', label: '勝率（日）', sub: stats.tradeDays + '日中 ' + stats.winDays + '勝' },
      { icon: '&#128200;', value: formatYen(stats.avgMonthPnl), cls: stats.avgMonthPnl >= 0 ? 'text-profit' : 'text-loss', label: '平均月間損益', sub: '黒字月 ' + winMonths + ' / 赤字月 ' + lossMonths },
      { icon: '&#9889;', value: stats.tradeDays + '日', cls: '', label: '総取引日数', sub: stats.activeMonths + 'ヶ月' }
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
      if (barPct < 2) barPct = 2;

      var tooltipStyle = entry.total >= 0
        ? 'bottom: ' + (halfHeight + barPct + 4) + 'px;'
        : 'top: ' + (halfHeight + barPct + 4) + 'px;';

      html += '<div class="report-bar-col">';
      html += '<div class="report-bar-tooltip ' + pnlClass + '" style="' + tooltipStyle + '">' + formatYen(entry.total) + '</div>';

      if (entry.total >= 0) {
        html += '<div class="report-bar-upper"><div class="report-bar profit" style="height: ' + barPct + 'px;"></div></div>';
        html += '<div class="report-bar-lower"></div>';
      } else {
        html += '<div class="report-bar-upper"></div>';
        html += '<div class="report-bar-lower"><div class="report-bar loss" style="height: ' + barPct + 'px;"></div></div>';
      }

      // Short label: "25/10" or "26/1"
      var shortLabel = String(entry.year).substring(2) + '/' + entry.month;
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
    for (var i = 0; i < MOCK_CATEGORIES.length; i++) {
      var mc = MOCK_CATEGORIES[i];
      var amount = catTotals[mc.id] || 0;
      if (amount === 0) continue;

      var amtClass = amount >= 0 ? 'text-profit' : 'text-loss';
      var barPct = maxAbs > 0 ? Math.round((Math.abs(amount) / maxAbs) * 100) : 0;

      html += '<div class="report-cat-item">' +
        '<span class="report-cat-dot" style="background: var(--' + mc.colorVar + ');"></span>' +
        '<span class="report-cat-name">' + mc.name + '</span>' +
        '<div class="report-cat-bar-track"><div class="report-cat-bar-fill" style="width: ' + barPct + '%; background: var(--' + mc.colorVar + ');"></div></div>' +
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

    if (bestContainer) {
      if (best.length === 0) {
        bestContainer.innerHTML = '<div class="report-rank-empty">利益月がありません</div>';
      } else {
        var html = '';
        for (var i = 0; i < best.length; i++) {
          html += '<div class="report-rank-item">' +
            '<span class="report-rank-num ' + rankClasses[i] + '">' + (i + 1) + '</span>' +
            '<span class="report-rank-date">' + best[i].label + '</span>' +
            '<span class="report-rank-comment">' + best[i].tradeDays + '日取引</span>' +
            '<span class="report-rank-amount text-profit">' + formatYen(best[i].total) + '</span>' +
          '</div>';
        }
        bestContainer.innerHTML = html;
      }
    }

    if (worstContainer) {
      if (worst.length === 0) {
        worstContainer.innerHTML = '<div class="report-rank-empty">損失月がありません</div>';
      } else {
        var html2 = '';
        for (var j = 0; j < worst.length; j++) {
          html2 += '<div class="report-rank-item">' +
            '<span class="report-rank-num ' + rankClasses[j] + '">' + (j + 1) + '</span>' +
            '<span class="report-rank-date">' + worst[j].label + '</span>' +
            '<span class="report-rank-comment">' + worst[j].tradeDays + '日取引</span>' +
            '<span class="report-rank-amount text-loss">' + formatYen(worst[j].total) + '</span>' +
          '</div>';
        }
        worstContainer.innerHTML = html2;
      }
    }
  }

  function renderGoalProgress() {
    var container = document.getElementById('goalProgress');
    if (!container) return;

    var yearlyGoal = MOCK_USER.yearlyGoal;
    var yearTotal = 0;

    for (var m = 1; m <= 12; m++) {
      var key = currentYear + '-' + String(m).padStart(2, '0');
      var monthData = MOCK_CALENDAR[key];
      if (monthData) {
        for (var d in monthData) {
          yearTotal += monthData[d].total;
        }
      }
    }

    var pct = yearlyGoal > 0 ? Math.min(Math.round((yearTotal / yearlyGoal) * 100), 100) : 0;
    if (yearTotal < 0) pct = 0;

    var remaining = yearlyGoal - yearTotal;
    var now = new Date();
    var remainingMonths = currentYear === now.getFullYear() ? (12 - (now.getMonth() + 1)) : (currentYear > now.getFullYear() ? 12 : 0);
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
