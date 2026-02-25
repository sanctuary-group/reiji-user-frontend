/**
 * Graph Page JS - Cumulative P&L Line Chart (Equity Curve)
 * Uses API: GET /api/pnl/report
 */
(function () {
  var now = new Date();
  var currentPeriod = 'monthly';
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth() + 1;

  // SVG layout constants
  var SVG_WIDTH = 800;
  var SVG_HEIGHT = 400;
  var PADDING = { top: 20, right: 20, bottom: 40, left: 70 };
  var CHART_W = SVG_WIDTH - PADDING.left - PADDING.right;
  var CHART_H = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  document.addEventListener('DOMContentLoaded', function () {
    // Check URL param for initial period
    var urlParams = new URLSearchParams(window.location.search);
    var paramPeriod = urlParams.get('period');
    if (paramPeriod && (paramPeriod === 'monthly' || paramPeriod === 'yearly' || paramPeriod === 'lifetime')) {
      currentPeriod = paramPeriod;
      var tabs = document.querySelectorAll('.graph-period-tab');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('active', tabs[i].getAttribute('data-period') === currentPeriod);
      }
    }
    initPeriodTabs();
    initNavigation();
    renderGraph();
  });

  // ---- Period Tabs ----
  function initPeriodTabs() {
    var tabs = document.querySelectorAll('.graph-period-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var newPeriod = this.getAttribute('data-period');
        if (newPeriod === currentPeriod) return;
        currentPeriod = newPeriod;
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.toggle('active', tabs[j].getAttribute('data-period') === currentPeriod);
        }
        renderGraph();
      });
    }
  }

  // ---- Navigation ----
  function initNavigation() {
    var prev = document.getElementById('prevPeriod');
    var next = document.getElementById('nextPeriod');

    if (prev) {
      prev.addEventListener('click', function () {
        if (currentPeriod === 'monthly') {
          currentMonth--;
          if (currentMonth < 1) { currentMonth = 12; currentYear--; }
        } else if (currentPeriod === 'yearly') {
          currentYear--;
        }
        renderGraph();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        if (currentPeriod === 'monthly') {
          currentMonth++;
          if (currentMonth > 12) { currentMonth = 1; currentYear++; }
        } else if (currentPeriod === 'yearly') {
          currentYear++;
        }
        renderGraph();
      });
    }
  }

  // ---- Main Render ----
  function renderGraph() {
    updateTitle();

    var url = '/api/pnl/report?period=' + currentPeriod;
    if (currentPeriod === 'monthly') {
      url += '&year=' + currentYear + '&month=' + currentMonth;
    } else if (currentPeriod === 'yearly') {
      url += '&year=' + currentYear;
    }

    apiFetch(url)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (apiData) {
        renderFromApi(apiData);
      })
      .catch(function () {
        renderFromMock();
      });
  }

  function renderFromApi(apiData) {
    var chartData = apiData.chartData || [];
    if (chartData.length === 0) { renderEmptyState(); return; }

    var points = [];
    var cumulative = 0;

    for (var i = 0; i < chartData.length; i++) {
      var cd = chartData[i];
      if (cd.value !== 0 || cumulative !== 0 || points.length > 0) {
        cumulative += cd.value;
        points.push({
          label: cd.label + (currentPeriod === 'monthly' ? '日' : ''),
          daily: cd.value,
          cumulative: cumulative
        });
      }
    }

    if (points.length === 0) { renderEmptyState(); return; }

    renderKpi(points);
    renderSvgChart(points);
    renderTable(points);
  }

  function renderFromMock() {
    if (currentPeriod === 'monthly') {
      renderMonthlyGraphMock();
    } else if (currentPeriod === 'yearly') {
      renderYearlyGraphMock();
    } else {
      renderLifetimeGraphMock();
    }
  }

  function updateTitle() {
    var titleEl = document.getElementById('graphTitle');
    var chartTitleEl = document.getElementById('chartTitle');
    var tableTitleEl = document.getElementById('tableTitle');
    var prevBtn = document.getElementById('prevPeriod');
    var nextBtn = document.getElementById('nextPeriod');

    if (currentPeriod === 'monthly') {
      if (titleEl) titleEl.textContent = currentYear + '年' + currentMonth + '月';
      if (chartTitleEl) chartTitleEl.textContent = '月間累計損益推移';
      if (tableTitleEl) tableTitleEl.textContent = '日別損益データ';
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    } else if (currentPeriod === 'yearly') {
      if (titleEl) titleEl.textContent = currentYear + '年';
      if (chartTitleEl) chartTitleEl.textContent = '年間累計損益推移';
      if (tableTitleEl) tableTitleEl.textContent = '月別損益データ';
      if (prevBtn) prevBtn.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    } else {
      if (titleEl) titleEl.textContent = '生涯損益';
      if (chartTitleEl) chartTitleEl.textContent = '生涯累計損益推移';
      if (tableTitleEl) tableTitleEl.textContent = '月別損益データ';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    }
  }

  // ================================================================
  //  MOCK FALLBACKS
  // ================================================================
  function renderMonthlyGraphMock() {
    var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    var monthData = (typeof MOCK_CALENDAR !== 'undefined') ? MOCK_CALENDAR[key] : null;

    if (!monthData || Object.keys(monthData).length === 0) {
      renderEmptyState();
      return;
    }

    var days = Object.keys(monthData).map(Number).sort(function (a, b) { return a - b; });
    var points = [];
    var cumulative = 0;
    for (var i = 0; i < days.length; i++) {
      cumulative += monthData[days[i]].total;
      points.push({
        label: days[i] + '日',
        daily: monthData[days[i]].total,
        cumulative: cumulative
      });
    }

    renderKpi(points);
    renderSvgChart(points);
    renderTable(points);
  }

  function renderYearlyGraphMock() {
    if (typeof MOCK_CALENDAR === 'undefined') { renderEmptyState(); return; }

    var points = [];
    var cumulative = 0;

    for (var m = 1; m <= 12; m++) {
      var key = currentYear + '-' + String(m).padStart(2, '0');
      var monthData = MOCK_CALENDAR[key];
      var monthTotal = 0;
      if (monthData) {
        var days = Object.keys(monthData);
        for (var d = 0; d < days.length; d++) {
          monthTotal += monthData[days[d]].total;
        }
      }
      if (monthTotal !== 0 || cumulative !== 0 || points.length > 0) {
        cumulative += monthTotal;
        points.push({
          label: m + '月',
          daily: monthTotal,
          cumulative: cumulative
        });
      }
    }

    if (points.length === 0) { renderEmptyState(); return; }

    renderKpi(points);
    renderSvgChart(points);
    renderTable(points);
  }

  function renderLifetimeGraphMock() {
    if (typeof MOCK_CALENDAR === 'undefined') { renderEmptyState(); return; }

    var keys = Object.keys(MOCK_CALENDAR).sort();
    var points = [];
    var cumulative = 0;

    for (var k = 0; k < keys.length; k++) {
      var monthData = MOCK_CALENDAR[keys[k]];
      var monthTotal = 0;
      var days = Object.keys(monthData);
      for (var d = 0; d < days.length; d++) {
        monthTotal += monthData[days[d]].total;
      }
      cumulative += monthTotal;

      var parts = keys[k].split('-');
      points.push({
        label: parts[0] + '/' + parseInt(parts[1], 10),
        daily: monthTotal,
        cumulative: cumulative
      });
    }

    if (points.length === 0) { renderEmptyState(); return; }

    renderKpi(points);
    renderSvgChart(points);
    renderTable(points);
  }

  // ================================================================
  //  EMPTY STATE
  // ================================================================
  function renderEmptyState() {
    var kpiEl = document.getElementById('graphKpi');
    var chartEl = document.getElementById('graphChart');
    var tableEl = document.getElementById('graphTable');
    if (kpiEl) kpiEl.innerHTML = '';
    if (chartEl) chartEl.innerHTML = '<div class="graph-table-empty">データがありません</div>';
    if (tableEl) tableEl.innerHTML = '<div class="graph-table-empty">データがありません</div>';
  }

  // ================================================================
  //  KPI CARDS
  // ================================================================
  function renderKpi(points) {
    var container = document.getElementById('graphKpi');
    if (!container) return;

    var first = points[0].cumulative - points[0].daily;
    var last = points[points.length - 1].cumulative;
    var max = points[0].cumulative;
    var min = points[0].cumulative;
    for (var i = 1; i < points.length; i++) {
      if (points[i].cumulative > max) max = points[i].cumulative;
      if (points[i].cumulative < min) min = points[i].cumulative;
    }

    var periodLabel = currentPeriod === 'monthly' ? '月間' : currentPeriod === 'yearly' ? '年間' : '生涯';
    var change = last - first;

    var kpis = [
      {
        icon: '<i class="fa-solid fa-flag-checkered"></i>',
        value: formatYen(first),
        cls: first >= 0 ? 'text-profit' : 'text-loss',
        label: '期首累計',
        sub: periodLabel + '開始時点'
      },
      {
        icon: '<i class="fa-solid fa-chart-line"></i>',
        value: formatYen(last),
        cls: last >= 0 ? 'text-profit' : 'text-loss',
        label: '期末累計',
        sub: '変動: ' + formatYen(change)
      },
      {
        icon: '<i class="fa-solid fa-arrow-up"></i>',
        value: formatYen(max),
        cls: 'text-profit',
        label: '最大累計',
        sub: periodLabel + '期間中の最高値'
      },
      {
        icon: '<i class="fa-solid fa-arrow-down"></i>',
        value: formatYen(min),
        cls: min >= 0 ? 'text-profit' : 'text-loss',
        label: '最小累計',
        sub: periodLabel + '期間中の最低値'
      }
    ];

    var html = '';
    for (var j = 0; j < kpis.length; j++) {
      var k = kpis[j];
      html += '<div class="graph-kpi">' +
        '<div class="graph-kpi-icon">' + k.icon + '</div>' +
        '<div class="graph-kpi-value ' + k.cls + '">' + k.value + '</div>' +
        '<div class="graph-kpi-label">' + k.label + '</div>' +
        '<div class="graph-kpi-sub">' + k.sub + '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  // ================================================================
  //  SVG LINE CHART
  // ================================================================
  function renderSvgChart(points) {
    var container = document.getElementById('graphChart');
    if (!container) return;

    // Calculate Y-axis range
    var allValues = [];
    for (var i = 0; i < points.length; i++) {
      allValues.push(points[i].cumulative);
    }
    var dataMin = Math.min.apply(null, allValues);
    var dataMax = Math.max.apply(null, allValues);

    // Add padding to range
    var range = dataMax - dataMin;
    if (range === 0) range = 1;
    var yPadding = range * 0.15;
    var yMin = dataMin - yPadding;
    var yMax = dataMax + yPadding;

    // Ensure zero is visible if data crosses zero
    if (dataMin >= 0 && yMin > 0) yMin = Math.min(0, yMin);
    if (dataMax <= 0 && yMax < 0) yMax = Math.max(0, yMax);

    var yRange = yMax - yMin;
    if (yRange === 0) yRange = 1;

    // Build SVG elements
    var svgParts = [];
    svgParts.push('<svg class="graph-svg" viewBox="0 0 ' + SVG_WIDTH + ' ' + SVG_HEIGHT + '" preserveAspectRatio="xMidYMid meet">');

    // Grid lines (5 horizontal)
    var gridCount = 5;
    for (var g = 0; g <= gridCount; g++) {
      var gy = PADDING.top + (g / gridCount) * CHART_H;
      var gVal = yMax - (g / gridCount) * yRange;
      svgParts.push('<line x1="' + PADDING.left + '" y1="' + gy + '" x2="' + (SVG_WIDTH - PADDING.right) + '" y2="' + gy + '" class="graph-grid-line" />');
      svgParts.push('<text x="' + (PADDING.left - 8) + '" y="' + (gy + 4) + '" class="graph-axis-label graph-axis-label-y">' + formatShortYen(gVal) + '</text>');
    }

    // Zero line
    if (yMin < 0 && yMax > 0) {
      var zeroY = PADDING.top + ((yMax - 0) / yRange) * CHART_H;
      svgParts.push('<line x1="' + PADDING.left + '" y1="' + zeroY + '" x2="' + (SVG_WIDTH - PADDING.right) + '" y2="' + zeroY + '" class="graph-zero-line" />');
    }

    // Data points → coordinates
    var coords = [];
    var xStep = points.length > 1 ? CHART_W / (points.length - 1) : CHART_W / 2;
    for (var p = 0; p < points.length; p++) {
      var px = PADDING.left + (points.length > 1 ? p * xStep : CHART_W / 2);
      var py = PADDING.top + ((yMax - points[p].cumulative) / yRange) * CHART_H;
      coords.push({ x: px, y: py });
    }

    // Area fill (polygon)
    var baseY = PADDING.top + ((yMax - Math.max(yMin, Math.min(0, yMax))) / yRange) * CHART_H;
    if (dataMin >= 0) {
      baseY = PADDING.top + CHART_H;
    } else if (dataMax <= 0) {
      baseY = PADDING.top;
    }

    var areaPoints = '';
    areaPoints += coords[0].x + ',' + baseY + ' ';
    for (var a = 0; a < coords.length; a++) {
      areaPoints += coords[a].x + ',' + coords[a].y + ' ';
    }
    areaPoints += coords[coords.length - 1].x + ',' + baseY;
    svgParts.push('<polygon points="' + areaPoints + '" class="graph-area" />');

    // Line
    var linePoints = '';
    for (var l = 0; l < coords.length; l++) {
      linePoints += coords[l].x + ',' + coords[l].y;
      if (l < coords.length - 1) linePoints += ' ';
    }
    svgParts.push('<polyline points="' + linePoints + '" class="graph-line" />');

    // Data point circles
    for (var c = 0; c < coords.length; c++) {
      svgParts.push('<circle cx="' + coords[c].x + '" cy="' + coords[c].y + '" r="5" class="graph-dot" data-index="' + c + '" />');
    }

    // X-axis labels
    var labelInterval = Math.max(1, Math.floor(points.length / 10));
    for (var xl = 0; xl < points.length; xl++) {
      if (xl % labelInterval === 0 || xl === points.length - 1) {
        svgParts.push('<text x="' + coords[xl].x + '" y="' + (SVG_HEIGHT - 8) + '" class="graph-axis-label graph-axis-label-x">' + points[xl].label + '</text>');
      }
    }

    svgParts.push('</svg>');

    // Tooltip element
    svgParts.push('<div class="graph-tooltip" id="graphTooltip"></div>');

    container.innerHTML = svgParts.join('');

    // Attach tooltip events
    attachTooltipEvents(container, points, coords);
  }

  // ---- Tooltip events ----
  function attachTooltipEvents(container, points, coords) {
    var tooltip = document.getElementById('graphTooltip');
    var dots = container.querySelectorAll('.graph-dot');

    for (var i = 0; i < dots.length; i++) {
      dots[i].addEventListener('mouseenter', function () {
        var idx = parseInt(this.getAttribute('data-index'), 10);
        var pt = points[idx];
        var coord = coords[idx];
        this.classList.add('active');

        var dailyClass = pt.daily >= 0 ? 'text-profit' : 'text-loss';
        var cumClass = pt.cumulative >= 0 ? 'text-profit' : 'text-loss';

        tooltip.innerHTML =
          '<div class="graph-tooltip-date">' + pt.label + '</div>' +
          '<div class="graph-tooltip-value ' + cumClass + '">累計: ' + formatYen(pt.cumulative) + '</div>' +
          '<div class="graph-tooltip-daily ' + dailyClass + '">損益: ' + formatYen(pt.daily) + '</div>';

        // Position tooltip
        var containerRect = container.getBoundingClientRect();
        var svgEl = container.querySelector('.graph-svg');
        var svgRect = svgEl.getBoundingClientRect();
        var scaleX = svgRect.width / SVG_WIDTH;
        var scaleY = svgRect.height / SVG_HEIGHT;

        var dotX = svgRect.left - containerRect.left + coord.x * scaleX;
        var dotY = svgRect.top - containerRect.top + coord.y * scaleY;

        tooltip.style.left = dotX + 'px';
        tooltip.style.top = (dotY - 70) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.classList.add('visible');
      });

      dots[i].addEventListener('mouseleave', function () {
        this.classList.remove('active');
        tooltip.classList.remove('visible');
      });
    }
  }

  // ================================================================
  //  DATA TABLE
  // ================================================================
  function renderTable(points) {
    var container = document.getElementById('graphTable');
    if (!container) return;

    var dailyLabel = currentPeriod === 'monthly' ? '日次損益' : '月間損益';

    var html = '<table class="graph-table">';
    html += '<thead><tr>';
    html += '<th>' + (currentPeriod === 'monthly' ? '日付' : '期間') + '</th>';
    html += '<th>' + dailyLabel + '</th>';
    html += '<th>累計損益</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < points.length; i++) {
      var pt = points[i];
      var dailyClass = pt.daily >= 0 ? 'text-profit' : 'text-loss';
      var cumClass = pt.cumulative >= 0 ? 'text-profit' : 'text-loss';
      html += '<tr>';
      html += '<td>' + pt.label + '</td>';
      html += '<td class="' + dailyClass + '">' + formatYen(pt.daily) + '</td>';
      html += '<td class="' + cumClass + '">' + formatYen(pt.cumulative) + '</td>';
      html += '</tr>';
    }

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // ---- Helpers ----
  function formatShortYen(amount) {
    var abs = Math.abs(amount);
    var sign = amount < 0 ? '-' : '';
    if (abs >= 1000000) {
      return sign + (abs / 10000).toFixed(0) + '万';
    } else if (abs >= 10000) {
      return sign + (abs / 10000).toFixed(1) + '万';
    }
    return sign + new Intl.NumberFormat('ja-JP').format(Math.round(amount));
  }
})();
