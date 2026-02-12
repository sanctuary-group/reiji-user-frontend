/**
 * Economic Indicators - 経済指標カレンダー
 * Date navigation, table rendering
 */
(function () {
  var currentDate = new Date(2026, 1, 12);

  document.addEventListener('DOMContentLoaded', function () {
    renderPage();
    initNavigation();
  });

  function initNavigation() {
    document.getElementById('prevDay').addEventListener('click', function () {
      currentDate.setDate(currentDate.getDate() - 1);
      renderPage();
    });
    document.getElementById('nextDay').addEventListener('click', function () {
      currentDate.setDate(currentDate.getDate() + 1);
      renderPage();
    });
  }

  function renderPage() {
    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    var y = currentDate.getFullYear();
    var m = currentDate.getMonth() + 1;
    var d = currentDate.getDate();
    var w = weekdays[currentDate.getDay()];
    document.getElementById('indiTitle').textContent = y + '年' + m + '月' + d + '日(' + w + ')';

    var mm = m < 10 ? '0' + m : '' + m;
    var dd = d < 10 ? '0' + d : '' + d;
    var key = y + '-' + mm + '-' + dd;

    var data = (typeof MOCK_INDICATORS_ALL !== 'undefined' && MOCK_INDICATORS_ALL[key])
      ? MOCK_INDICATORS_ALL[key] : [];

    renderTable(data);
  }

  function renderTable(data) {
    var tbody = document.getElementById('indiTableBody');
    var emptyEl = document.getElementById('indiEmpty');
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.classList.add('visible');
      return;
    }
    if (emptyEl) emptyEl.classList.remove('visible');

    var html = '';
    for (var i = 0; i < data.length; i++) {
      var ind = data[i];
      var actualHtml = ind.actual
        ? '<span class="indi-val-actual">' + ind.actual + '</span>'
        : '<span class="indi-val-pending">-</span>';

      html += '<tr class="indi-tr">' +
        '<td class="indi-td indi-td-time">' + ind.time + '</td>' +
        '<td class="indi-td indi-td-country">' + ind.country + '</td>' +
        '<td class="indi-td">' + ind.name + '</td>' +
        '<td class="indi-td indi-td-importance"><span class="indi-dot ' + ind.importance + '"></span></td>' +
        '<td class="indi-td indi-td-val">' + actualHtml + '</td>' +
        '<td class="indi-td indi-td-val">' + ind.forecast + '</td>' +
        '<td class="indi-td indi-td-val">' + ind.previous + '</td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }
})();
