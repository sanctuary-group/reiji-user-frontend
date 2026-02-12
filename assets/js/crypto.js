/**
 * Crypto Rates - 仮想通貨レート一覧
 * Tab switching, table rendering
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderTable('marketcap');
    initTabs();
  });

  function renderTable(tab) {
    var tbody = document.getElementById('cryptoTableBody');
    if (!tbody || typeof MOCK_CRYPTO_ALL === 'undefined') return;

    var data = [];
    var i;
    if (tab === 'trending') {
      for (i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
        if (MOCK_CRYPTO_ALL[i].trending) data.push(MOCK_CRYPTO_ALL[i]);
      }
      data.sort(function (a, b) { return b.change - a.change; });
    } else {
      data = MOCK_CRYPTO_ALL.slice();
    }

    var html = '';
    for (i = 0; i < data.length; i++) {
      var coin = data[i];
      var changeClass = coin.change >= 0 ? 'text-profit' : 'text-loss';
      var changeSign = coin.change >= 0 ? '+' : '';
      var priceStr = coin.price >= 1000
        ? '¥' + new Intl.NumberFormat('ja-JP').format(coin.price)
        : '¥' + coin.price.toFixed(4);
      var rankDisplay = tab === 'trending' ? (i + 1) : coin.rank;

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
