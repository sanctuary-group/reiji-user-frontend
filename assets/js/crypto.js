/**
 * Crypto Rates - 仮想通貨レート一覧
 * Tab switching, table rendering
 */
(function () {
  var _marketsData = null;
  var _trendingData = null;

  document.addEventListener('DOMContentLoaded', function () {
    fetchMarkets();
    fetchTrending();
    initTabs();
  });

  function fetchMarkets() {
    fetch('/api/crypto/markets', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      _marketsData = json.data;
      renderTable('marketcap');
    })
    .catch(function () {
      _marketsData = [];
      renderTable('marketcap');
    });
  }

  function fetchTrending() {
    fetch('/api/crypto/trending', {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('API error');
      return res.json();
    })
    .then(function (json) {
      _trendingData = json.data;
    })
    .catch(function () {});
  }

  function renderTable(tab) {
    var tbody = document.getElementById('cryptoTableBody');
    if (!tbody) return;

    var data;
    if (tab === 'trending') {
      data = _trendingData;
      if (!data) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#888;">読み込み中...</td></tr>';
        fetchTrending();
        return;
      }
    } else {
      data = _marketsData;
      if (!data) return;
    }

    var html = '';
    for (var i = 0; i < data.length; i++) {
      var coin = data[i];
      var changeClass = coin.change >= 0 ? 'text-profit' : 'text-loss';
      var changeSign = coin.change >= 0 ? '+' : '';
      var priceStr = coin.price >= 1000
        ? '¥' + new Intl.NumberFormat('ja-JP').format(coin.price)
        : '¥' + coin.price.toFixed(4);
      var rankDisplay = coin.rank || (i + 1);

      html += '<tr class="crypt-tr">' +
        '<td class="crypt-td crypt-td-rank">' + rankDisplay + '</td>' +
        '<td class="crypt-td"><div class="crypt-name-cell">' +
          '<span class="crypt-symbol">' + coin.symbol + '</span>' +
          '<span class="crypt-fullname">' + coin.name + '</span>' +
        '</div></td>' +
        '<td class="crypt-td crypt-td-price">' + priceStr + '</td>' +
        '<td class="crypt-td crypt-td-change ' + changeClass + '">' + changeSign + coin.change.toFixed(2) + '%</td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }

  function initTabs() {
    var tabs = document.querySelectorAll('.crypt-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        for (var j = 0; j < tabs.length; j++) {
          tabs[j].classList.remove('active');
        }
        this.classList.add('active');
        renderTable(this.getAttribute('data-tab'));
      });
    }
  }
})();
