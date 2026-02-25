/**
 * Economic Indicators - 経済指標カレンダー
 * Date navigation, table rendering
 */
(function () {
  var currentDate = new Date();

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

  function formatDateKey(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    var mm = m < 10 ? '0' + m : '' + m;
    var dd = d < 10 ? '0' + d : '' + d;
    return y + '-' + mm + '-' + dd;
  }

  function renderPage() {
    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    var y = currentDate.getFullYear();
    var m = currentDate.getMonth() + 1;
    var d = currentDate.getDate();
    var w = weekdays[currentDate.getDay()];
    document.getElementById('indiTitle').textContent = y + '年' + m + '月' + d + '日(' + w + ')';

    var key = formatDateKey(currentDate);

    fetch('/api/economic/indicators?date=' + key, {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      renderTable(json.data);
    })
    .catch(function () {
      var data = (typeof MOCK_INDICATORS_ALL !== 'undefined' && MOCK_INDICATORS_ALL[key])
        ? MOCK_INDICATORS_ALL[key] : [];
      renderTable(data);
    });
  }

  function renderTable(data) {
    var tbody = document.getElementById('indiTableBody');
    var emptyEl = document.getElementById('indiEmpty');
    if (!tbody) return;

    if (!data || data.length === 0) {
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

      var starCount = ind.importance || 1;
      var stars = Array(starCount + 1).join('★');
      var level = starCount >= 4 ? 'high' : starCount >= 3 ? 'medium' : 'low';

      html += '<tr class="indi-tr">' +
        '<td class="indi-td indi-td-time">' + ind.time + '</td>' +
        '<td class="indi-td indi-td-country">' + ind.country + '</td>' +
        '<td class="indi-td indi-td-name">' + ind.name + '</td>' +
        '<td class="indi-td indi-td-importance"><span class="indi-stars ' + level + '">' + stars + '</span></td>' +
        '<td class="indi-td indi-td-val">' + actualHtml + '</td>' +
        '<td class="indi-td indi-td-val">' + ind.forecast + '</td>' +
        '<td class="indi-td indi-td-val">' + ind.previous + '</td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }
})();
