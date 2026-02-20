/**
 * Settings - Tabs, profile form, goal calc, category list, theme, toasts
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initProfileForm();
    initGoalForm();
    initCategories();
    initThemeOptions();
    initToastActions();
    initCustomCoins();
    initCryptoHoldings();
    renderCryptoAllocationChart();
    initPnlChart();
  });

  /* ---- Tab Navigation ---- */
  function initTabs() {
    var tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = this.getAttribute('data-tab');

        // Deactivate all
        tabs.forEach(function (t) { t.classList.remove('active'); });
        document.querySelectorAll('.settings-panel').forEach(function (p) { p.classList.remove('active'); });

        // Activate selected
        this.classList.add('active');
        var panel = document.getElementById('panel-' + target);
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ---- Profile Form ---- */
  function initProfileForm() {
    var bioEl = document.getElementById('settingsBio');
    var bioCount = document.getElementById('bioCount');

    if (bioEl && bioCount) {
      function updateCount() {
        bioCount.textContent = bioEl.value.length + '/200';
      }
      updateCount();
      bioEl.addEventListener('input', updateCount);
    }

    var form = document.getElementById('profileForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        showToast('プロフィールを保存しました');
      });
    }

    var saveBtn = document.getElementById('saveProfile');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        showToast('プロフィールを保存しました');
      });
    }
  }

  /* ---- Goal Form ---- */
  function initGoalForm() {
    var amountInput = document.getElementById('settingsGoalAmount');
    var monthlyAvg = document.getElementById('goalMonthlyAvg');

    function updateMonthly() {
      if (!amountInput || !monthlyAvg) return;
      var raw = amountInput.value.replace(/[^0-9]/g, '');
      var amount = parseInt(raw) || 0;

      // Format the input
      if (raw) {
        amountInput.value = new Intl.NumberFormat('ja-JP').format(amount);
      }

      var monthly = Math.round(amount / 12);
      monthlyAvg.textContent = new Intl.NumberFormat('ja-JP').format(monthly) + '円';
    }

    if (amountInput) {
      amountInput.addEventListener('input', updateMonthly);
      updateMonthly();
    }

    var saveBtn = document.getElementById('saveGoal');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        showToast('年間目標を保存しました');
      });
    }
  }

  /* ---- Category Management ---- */
  function initCategories() {
    renderCategories();

    var addBtn = document.getElementById('addCategory');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        showToast('カテゴリ追加機能（プロトタイプ）');
      });
    }
  }

  function renderCategories() {
    var container = document.getElementById('categoryList');
    if (!container) return;

    var html = '';
    for (var i = 0; i < MOCK_CATEGORIES.length; i++) {
      var cat = MOCK_CATEGORIES[i];
      html += '<div class="settings-cat-item">' +
        '<span class="settings-cat-dot" style="background: var(--' + cat.colorVar + ');"></span>' +
        '<span class="settings-cat-name">' + cat.name + '</span>' +
        '<span class="settings-cat-id">' + cat.id + '</span>' +
        '<div class="settings-cat-actions">' +
          '<button class="settings-cat-btn edit" title="編集" data-id="' + cat.id + '"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="settings-cat-btn delete" title="削除" data-id="' + cat.id + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;

    // Event listeners
    container.querySelectorAll('.settings-cat-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showToast('カテゴリ編集機能（プロトタイプ）');
      });
    });

    container.querySelectorAll('.settings-cat-btn.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showToast('カテゴリ削除機能（プロトタイプ）');
      });
    });
  }

  /* ---- Theme Options ---- */
  function initThemeOptions() {
    var buttons = document.querySelectorAll('.settings-theme-btn');
    if (!buttons.length) return;

    // Determine current theme
    var stored = localStorage.getItem('reiji-theme');
    var activeTheme = stored || 'system';

    function setActive(theme) {
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-theme') === theme);
      });
    }

    setActive(activeTheme);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var theme = this.getAttribute('data-theme');
        setActive(theme);

        if (theme === 'system') {
          localStorage.removeItem('reiji-theme');
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', systemTheme);
        } else {
          localStorage.setItem('reiji-theme', theme);
          document.documentElement.setAttribute('data-theme', theme);
        }

        // Update theme toggle button icon
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
          toggleBtn.textContent = currentTheme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
        }

        showToast('テーマを変更しました');
      });
    });
  }

  /* ---- Toast Actions (danger zone, export) ---- */
  function initToastActions() {
    var exportBtn = document.getElementById('exportCsv');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        showToast('CSVダウンロード機能（プロトタイプ）');
      });
    }

    var deleteDataBtn = document.getElementById('deleteData');
    if (deleteDataBtn) {
      deleteDataBtn.addEventListener('click', function () {
        if (confirm('本当にすべての損益データを削除しますか？\nこの操作は取り消せません。')) {
          showToast('データを削除しました（プロトタイプ）');
        }
      });
    }

    var deleteAccountBtn = document.getElementById('deleteAccount');
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function () {
        if (confirm('本当にアカウントを削除しますか？\nすべてのデータが失われます。')) {
          showToast('アカウントを削除しました（プロトタイプ）');
        }
      });
    }
  }

  /* ---- Crypto Holdings ---- */
  var CHART_COLORS = ['#63b3ed', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  function initCryptoHoldings() {
    populateCurrencySelect();
    renderHoldingsList();

    var addBtn = document.getElementById('addHolding');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var selectEl = document.getElementById('holdingCurrency');
        var quantityEl = document.getElementById('holdingQuantity');
        if (!selectEl || !quantityEl) return;

        var symbol = selectEl.value;
        var quantity = parseFloat(quantityEl.value);
        if (!symbol || isNaN(quantity) || quantity <= 0) {
          showToast('通貨と数量を正しく入力してください');
          return;
        }

        for (var i = 0; i < MOCK_CRYPTO_HOLDINGS.length; i++) {
          if (MOCK_CRYPTO_HOLDINGS[i].symbol === symbol) {
            showToast('この通貨は既に登録されています');
            return;
          }
        }

        var coinData = findCoin(symbol);
        MOCK_CRYPTO_HOLDINGS.push({
          symbol: symbol,
          name: coinData ? coinData.name : symbol,
          quantity: quantity
        });

        quantityEl.value = '';
        selectEl.value = '';
        renderHoldingsList();
        renderCryptoAllocationChart();
        showToast(symbol + ' を追加しました');
      });
    }

    var saveBtn = document.getElementById('saveCryptoHoldings');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        showToast('保有通貨を保存しました');
      });
    }
  }

  function findCoin(symbol) {
    if (typeof MOCK_CRYPTO_ALL !== 'undefined') {
      for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
        if (MOCK_CRYPTO_ALL[i].symbol === symbol) return MOCK_CRYPTO_ALL[i];
      }
    }
    if (typeof MOCK_CUSTOM_COINS !== 'undefined') {
      for (var j = 0; j < MOCK_CUSTOM_COINS.length; j++) {
        if (MOCK_CUSTOM_COINS[j].symbol === symbol) return MOCK_CUSTOM_COINS[j];
      }
    }
    return null;
  }

  function findCoinColor(symbol) {
    if (typeof MOCK_CUSTOM_COINS !== 'undefined') {
      for (var i = 0; i < MOCK_CUSTOM_COINS.length; i++) {
        if (MOCK_CUSTOM_COINS[i].symbol === symbol) return MOCK_CUSTOM_COINS[i].color;
      }
    }
    return null;
  }

  function populateCurrencySelect() {
    var selectEl = document.getElementById('holdingCurrency');
    if (!selectEl) return;

    var html = '<option value="">選択してください</option>';
    if (typeof MOCK_CRYPTO_ALL !== 'undefined') {
      for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
        var coin = MOCK_CRYPTO_ALL[i];
        html += '<option value="' + coin.symbol + '">' + coin.symbol + ' - ' + coin.name + '</option>';
      }
    }
    if (typeof MOCK_CUSTOM_COINS !== 'undefined' && MOCK_CUSTOM_COINS.length > 0) {
      html += '<option disabled>── カスタム通貨 ──</option>';
      for (var j = 0; j < MOCK_CUSTOM_COINS.length; j++) {
        var cc = MOCK_CUSTOM_COINS[j];
        html += '<option value="' + cc.symbol + '">' + cc.symbol + ' - ' + cc.name + '</option>';
      }
    }
    selectEl.innerHTML = html;
  }

  function renderHoldingsList() {
    var container = document.getElementById('cryptoHoldingsList');
    if (!container || typeof MOCK_CRYPTO_HOLDINGS === 'undefined') return;

    if (MOCK_CRYPTO_HOLDINGS.length === 0) {
      container.innerHTML = '<p class="settings-card-desc" style="text-align:center;padding:var(--space-4) 0;">保有通貨が登録されていません。</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < MOCK_CRYPTO_HOLDINGS.length; i++) {
      var h = MOCK_CRYPTO_HOLDINGS[i];
      var coin = findCoin(h.symbol);
      var priceJPY = coin ? coin.price : 0;
      var valueJPY = h.quantity * priceJPY;

      // Display mode
      var coinColor = findCoinColor(h.symbol);
      var colorDot = coinColor ? '<span class="crypto-holding-dot" style="background:' + coinColor + ';"></span>' : '';
      html += '<div class="crypto-holding-item" data-index="' + i + '">' +
        '<div class="crypto-holding-display">' +
          colorDot +
          '<span class="crypto-holding-symbol">' + h.symbol + '</span>' +
          '<span class="crypto-holding-name">' + h.name + '</span>' +
          '<span class="crypto-holding-qty font-mono">' + h.quantity + '</span>' +
          '<span class="crypto-holding-value font-mono">\u2248 \u00a5' + new Intl.NumberFormat('ja-JP').format(Math.round(valueJPY)) + '</span>' +
          '<button class="settings-cat-btn edit" title="\u7de8\u96c6" data-index="' + i + '"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="settings-cat-btn delete" title="\u524a\u9664" data-index="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        // Edit mode (hidden by default)
        '<div class="crypto-holding-edit" style="display:none;">' +
          '<select class="form-input form-select crypto-edit-symbol" data-index="' + i + '">' + buildCoinOptions(h.symbol) + '</select>' +
          '<input class="form-input crypto-edit-qty" type="text" value="' + h.quantity + '" inputmode="decimal" data-index="' + i + '">' +
          '<button class="btn btn-primary btn-sm crypto-edit-save" data-index="' + i + '"><i class="fa-solid fa-check"></i></button>' +
          '<button class="btn btn-secondary btn-sm crypto-edit-cancel" data-index="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;

    // Edit button
    container.querySelectorAll('.settings-cat-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.crypto-holding-item');
        item.querySelector('.crypto-holding-display').style.display = 'none';
        item.querySelector('.crypto-holding-edit').style.display = 'flex';
      });
    });

    // Cancel button
    container.querySelectorAll('.crypto-edit-cancel').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.crypto-holding-item');
        item.querySelector('.crypto-holding-display').style.display = '';
        item.querySelector('.crypto-holding-edit').style.display = 'none';
      });
    });

    // Save button
    container.querySelectorAll('.crypto-edit-save').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var item = this.closest('.crypto-holding-item');
        var newSymbol = item.querySelector('.crypto-edit-symbol').value;
        var newQty = parseFloat(item.querySelector('.crypto-edit-qty').value);

        if (!newSymbol || isNaN(newQty) || newQty <= 0) {
          showToast('通貨と数量を正しく入力してください');
          return;
        }

        // Duplicate check (excluding self)
        for (var i = 0; i < MOCK_CRYPTO_HOLDINGS.length; i++) {
          if (i !== index && MOCK_CRYPTO_HOLDINGS[i].symbol === newSymbol) {
            showToast('この通貨は既に登録されています');
            return;
          }
        }

        var coinData = findCoin(newSymbol);
        MOCK_CRYPTO_HOLDINGS[index].symbol = newSymbol;
        MOCK_CRYPTO_HOLDINGS[index].name = coinData ? coinData.name : newSymbol;
        MOCK_CRYPTO_HOLDINGS[index].quantity = newQty;

        renderHoldingsList();
        renderCryptoAllocationChart();
        showToast(newSymbol + ' を更新しました');
      });
    });

    // Delete button
    container.querySelectorAll('.settings-cat-btn.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var removed = MOCK_CRYPTO_HOLDINGS.splice(index, 1);
        renderHoldingsList();
        renderCryptoAllocationChart();
        showToast((removed[0] ? removed[0].symbol : '') + ' を削除しました');
      });
    });
  }

  function buildCoinOptions(selectedSymbol) {
    var html = '';
    if (typeof MOCK_CRYPTO_ALL !== 'undefined') {
      for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
        var coin = MOCK_CRYPTO_ALL[i];
        var sel = coin.symbol === selectedSymbol ? ' selected' : '';
        html += '<option value="' + coin.symbol + '"' + sel + '>' + coin.symbol + ' - ' + coin.name + '</option>';
      }
    }
    if (typeof MOCK_CUSTOM_COINS !== 'undefined' && MOCK_CUSTOM_COINS.length > 0) {
      html += '<option disabled>── カスタム通貨 ──</option>';
      for (var j = 0; j < MOCK_CUSTOM_COINS.length; j++) {
        var cc = MOCK_CUSTOM_COINS[j];
        var sel2 = cc.symbol === selectedSymbol ? ' selected' : '';
        html += '<option value="' + cc.symbol + '"' + sel2 + '>' + cc.symbol + ' - ' + cc.name + '</option>';
      }
    }
    return html;
  }

  /* ---- Custom Coins ---- */
  function initCustomCoins() {
    renderCustomCoinsList();

    var addBtn = document.getElementById('addCustomCoin');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var symbolEl = document.getElementById('customCoinSymbol');
        var nameEl = document.getElementById('customCoinName');
        var colorEl = document.getElementById('customCoinColor');
        if (!symbolEl || !nameEl || !colorEl) return;

        var symbol = symbolEl.value.trim().toUpperCase();
        var name = nameEl.value.trim();
        var color = colorEl.value;

        if (!symbol || !name) {
          showToast('シンボルと通貨名を入力してください');
          return;
        }

        // Check duplicate in MOCK_CRYPTO_ALL
        if (typeof MOCK_CRYPTO_ALL !== 'undefined') {
          for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
            if (MOCK_CRYPTO_ALL[i].symbol === symbol) {
              showToast('この通貨は既に標準リストに存在します');
              return;
            }
          }
        }

        // Check duplicate in MOCK_CUSTOM_COINS
        for (var j = 0; j < MOCK_CUSTOM_COINS.length; j++) {
          if (MOCK_CUSTOM_COINS[j].symbol === symbol) {
            showToast('この通貨は既に登録されています');
            return;
          }
        }

        MOCK_CUSTOM_COINS.push({ symbol: symbol, name: name, color: color, price: 0 });

        symbolEl.value = '';
        nameEl.value = '';
        colorEl.value = '#63b3ed';

        renderCustomCoinsList();
        populateCurrencySelect();
        showToast(symbol + ' を登録しました');
      });
    }
  }

  function renderCustomCoinsList() {
    var container = document.getElementById('customCoinsList');
    if (!container || typeof MOCK_CUSTOM_COINS === 'undefined') return;

    if (MOCK_CUSTOM_COINS.length === 0) {
      container.innerHTML = '<p class="settings-card-desc" style="text-align:center;padding:var(--space-4) 0;">カスタム通貨は登録されていません。</p>';
      return;
    }

    var html = '';
    for (var i = 0; i < MOCK_CUSTOM_COINS.length; i++) {
      var cc = MOCK_CUSTOM_COINS[i];
      html += '<div class="custom-coin-item" data-index="' + i + '">' +
        '<div class="custom-coin-display">' +
          '<span class="custom-coin-dot" style="background:' + cc.color + ';"></span>' +
          '<span class="custom-coin-symbol">' + cc.symbol + '</span>' +
          '<span class="custom-coin-name">' + cc.name + '</span>' +
          '<button class="settings-cat-btn edit" title="\u7de8\u96c6" data-index="' + i + '"><i class="fa-solid fa-pen"></i></button>' +
          '<button class="settings-cat-btn delete" title="\u524a\u9664" data-index="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<div class="custom-coin-edit" style="display:none;">' +
          '<input class="form-input custom-coin-edit-symbol" type="text" value="' + cc.symbol + '" data-index="' + i + '" style="width:80px;text-transform:uppercase;">' +
          '<input class="form-input custom-coin-edit-name" type="text" value="' + cc.name + '" data-index="' + i + '" style="flex:1;">' +
          '<input class="custom-coin-color-input custom-coin-edit-color" type="color" value="' + cc.color + '" data-index="' + i + '">' +
          '<button class="btn btn-primary btn-sm custom-coin-edit-save" data-index="' + i + '"><i class="fa-solid fa-check"></i></button>' +
          '<button class="btn btn-secondary btn-sm custom-coin-edit-cancel" data-index="' + i + '"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = html;

    // Edit
    container.querySelectorAll('.settings-cat-btn.edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.custom-coin-item');
        item.querySelector('.custom-coin-display').style.display = 'none';
        item.querySelector('.custom-coin-edit').style.display = 'flex';
      });
    });

    // Cancel
    container.querySelectorAll('.custom-coin-edit-cancel').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = this.closest('.custom-coin-item');
        item.querySelector('.custom-coin-display').style.display = '';
        item.querySelector('.custom-coin-edit').style.display = 'none';
      });
    });

    // Save
    container.querySelectorAll('.custom-coin-edit-save').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var item = this.closest('.custom-coin-item');
        var newSymbol = item.querySelector('.custom-coin-edit-symbol').value.trim().toUpperCase();
        var newName = item.querySelector('.custom-coin-edit-name').value.trim();
        var newColor = item.querySelector('.custom-coin-edit-color').value;

        if (!newSymbol || !newName) {
          showToast('シンボルと通貨名を入力してください');
          return;
        }

        // Duplicate check (excluding self)
        for (var i = 0; i < MOCK_CUSTOM_COINS.length; i++) {
          if (i !== index && MOCK_CUSTOM_COINS[i].symbol === newSymbol) {
            showToast('この通貨は既に登録されています');
            return;
          }
        }

        var oldSymbol = MOCK_CUSTOM_COINS[index].symbol;
        MOCK_CUSTOM_COINS[index].symbol = newSymbol;
        MOCK_CUSTOM_COINS[index].name = newName;
        MOCK_CUSTOM_COINS[index].color = newColor;

        // Update holdings that use this coin
        for (var h = 0; h < MOCK_CRYPTO_HOLDINGS.length; h++) {
          if (MOCK_CRYPTO_HOLDINGS[h].symbol === oldSymbol) {
            MOCK_CRYPTO_HOLDINGS[h].symbol = newSymbol;
            MOCK_CRYPTO_HOLDINGS[h].name = newName;
          }
        }

        renderCustomCoinsList();
        populateCurrencySelect();
        renderHoldingsList();
        renderCryptoAllocationChart();
        showToast(newSymbol + ' を更新しました');
      });
    });

    // Delete
    container.querySelectorAll('.settings-cat-btn.delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        var removed = MOCK_CUSTOM_COINS.splice(index, 1);
        renderCustomCoinsList();
        populateCurrencySelect();
        renderCryptoAllocationChart();
        showToast((removed[0] ? removed[0].symbol : '') + ' を削除しました');
      });
    });
  }

  /* ---- Crypto Allocation Donut Chart ---- */
  function renderCryptoAllocationChart() {
    var container = document.getElementById('cryptoAllocationChart');
    var card = document.getElementById('cryptoAllocationCard');
    if (!container || !card) return;
    if (typeof MOCK_CRYPTO_HOLDINGS === 'undefined' || MOCK_CRYPTO_HOLDINGS.length === 0) {
      card.style.display = 'none';
      return;
    }
    card.style.display = '';

    var items = [];
    var totalJPY = 0;
    for (var i = 0; i < MOCK_CRYPTO_HOLDINGS.length; i++) {
      var h = MOCK_CRYPTO_HOLDINGS[i];
      var coin = findCoin(h.symbol);
      var priceJPY = coin ? coin.price : 0;
      var value = h.quantity * priceJPY;
      items.push({ symbol: h.symbol, name: h.name, quantity: h.quantity, value: value });
      totalJPY += value;
    }

    items.sort(function (a, b) { return b.value - a.value; });

    // Build conic-gradient
    var gradientParts = [];
    var cumulative = 0;
    for (var k = 0; k < items.length; k++) {
      var pct = totalJPY > 0 ? (items[k].value / totalJPY) * 100 : 0;
      var customColor = findCoinColor(items[k].symbol);
      var color = customColor || CHART_COLORS[k % CHART_COLORS.length];
      items[k].color = color;
      items[k].pct = pct;
      gradientParts.push(color + ' ' + cumulative.toFixed(2) + '% ' + (cumulative + pct).toFixed(2) + '%');
      cumulative += pct;
    }

    var gradientCSS = 'conic-gradient(' + gradientParts.join(', ') + ')';

    var html = '';

    // Donut
    html += '<div class="crypto-donut-wrapper">';
    html += '<div class="crypto-donut" style="background: ' + gradientCSS + ';">';
    html += '<div class="crypto-donut-hole">';
    html += '<div class="crypto-donut-center-label">合計資産額</div>';
    html += '<div class="crypto-donut-center-value">\u00a5' + new Intl.NumberFormat('ja-JP').format(Math.round(totalJPY)) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Legend table
    html += '<div class="crypto-legend-table">';
    html += '<div class="crypto-legend-header">';
    html += '<span>\u901a\u8ca8</span><span>\u5272\u5408</span><span>\u6570\u91cf</span>';
    html += '</div>';
    for (var m = 0; m < items.length; m++) {
      var it = items[m];
      html += '<div class="crypto-legend-row">';
      html += '<span class="crypto-legend-currency">';
      html += '<span class="crypto-legend-dot" style="background:' + it.color + ';"></span>';
      html += it.symbol;
      html += '</span>';
      html += '<span class="crypto-legend-pct font-mono">' + it.pct.toFixed(2) + '%</span>';
      html += '<span class="crypto-legend-qty font-mono">' + it.quantity + '</span>';
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;
  }

  /* ---- P&L Area Chart ---- */
  function initPnlChart() {
    var tabs = document.querySelectorAll('.pnl-period-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        renderPnlChart(parseInt(this.getAttribute('data-period')));
      });
    });
    renderPnlChart(7);
  }

  function getPnlData(days) {
    if (typeof MOCK_CALENDAR === 'undefined') return [];
    var today = new Date(2026, 1, 20);
    var data = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      var ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      var day = d.getDate();
      var pnl = 0;
      if (MOCK_CALENDAR[ym] && MOCK_CALENDAR[ym][day]) {
        pnl = MOCK_CALENDAR[ym][day].total;
      }
      data.push({
        dateStr: String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'),
        pnl: pnl
      });
    }
    return data;
  }

  function renderPnlChart(period) {
    var container = document.getElementById('pnlChartArea');
    var summaryEl = document.getElementById('pnlSummaryRow');
    if (!container) return;

    var data = getPnlData(period);
    if (data.length === 0) { container.innerHTML = ''; return; }

    // Cumulative P&L
    var cumVals = [];
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
      sum += data[i].pnl;
      cumVals.push(sum);
    }

    // Summary stats
    var todayPnl = data[data.length - 1].pnl;
    var sevenSum = 0;
    var thirtySum = 0;
    var allData30 = getPnlData(30);
    for (var j = 0; j < allData30.length; j++) {
      thirtySum += allData30[j].pnl;
      if (j >= allData30.length - 7) sevenSum += allData30[j].pnl;
    }

    if (summaryEl) {
      summaryEl.innerHTML =
        '<div class="pnl-summary-item">' +
          '<div class="pnl-summary-label">\u4eca\u65e5\u306e\u640d\u76ca</div>' +
          '<div class="pnl-summary-value ' + (todayPnl >= 0 ? 'text-profit' : 'text-loss') + '">' + formatPnlJPY(todayPnl) + '</div>' +
        '</div>' +
        '<div class="pnl-summary-item">' +
          '<div class="pnl-summary-label">7\u65e5\u9593\u306e\u640d\u76ca\u984d</div>' +
          '<div class="pnl-summary-value ' + (sevenSum >= 0 ? 'text-profit' : 'text-loss') + '">' + formatPnlJPY(sevenSum) + '</div>' +
        '</div>' +
        '<div class="pnl-summary-item">' +
          '<div class="pnl-summary-label">30\u65e5\u9593\u640d\u76ca</div>' +
          '<div class="pnl-summary-value ' + (thirtySum >= 0 ? 'text-profit' : 'text-loss') + '">' + formatPnlJPY(thirtySum) + '</div>' +
        '</div>';
    }

    // Chart label & value
    var totalPnl = cumVals[cumVals.length - 1];
    var chartColor = totalPnl >= 0 ? '#63b3ed' : '#ef4444';

    // SVG dimensions
    var W = 480, H = 220;
    var PL = 56, PR = 16, PT = 16, PB = 28;
    var cW = W - PL - PR;
    var cH = H - PT - PB;

    var maxV = Math.max.apply(null, cumVals);
    var minV = Math.min.apply(null, cumVals);
    var range = maxV - minV;
    if (range === 0) range = 1;
    maxV += range * 0.1;
    minV -= range * 0.1;
    range = maxV - minV;

    function mx(idx) { return PL + (idx / Math.max(cumVals.length - 1, 1)) * cW; }
    function my(val) { return PT + (1 - (val - minV) / range) * cH; }

    // Build smooth path (Catmull-Rom to Bezier)
    var pts = [];
    for (var k = 0; k < cumVals.length; k++) {
      pts.push({ x: mx(k), y: my(cumVals[k]) });
    }

    var linePath = '';
    if (pts.length === 1) {
      linePath = 'M' + pts[0].x + ',' + pts[0].y;
    } else {
      linePath = 'M' + pts[0].x + ',' + pts[0].y;
      for (var s = 0; s < pts.length - 1; s++) {
        var p0 = pts[Math.max(0, s - 1)];
        var p1 = pts[s];
        var p2 = pts[s + 1];
        var p3 = pts[Math.min(pts.length - 1, s + 2)];
        var cp1x = p1.x + (p2.x - p0.x) / 6;
        var cp1y = p1.y + (p2.y - p0.y) / 6;
        var cp2x = p2.x - (p3.x - p1.x) / 6;
        var cp2y = p2.y - (p3.y - p1.y) / 6;
        linePath += ' C' + cp1x.toFixed(1) + ',' + cp1y.toFixed(1) + ' ' + cp2x.toFixed(1) + ',' + cp2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
      }
    }

    var bottomY = PT + cH;
    var areaPath = linePath + ' L' + pts[pts.length - 1].x.toFixed(1) + ',' + bottomY + ' L' + pts[0].x.toFixed(1) + ',' + bottomY + ' Z';

    // Grid lines (5 levels)
    var gridSvg = '';
    for (var g = 0; g <= 4; g++) {
      var yVal = minV + (range * g / 4);
      var yPos = my(yVal);
      gridSvg += '<line x1="' + PL + '" y1="' + yPos.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + yPos.toFixed(1) + '" stroke="var(--border-primary)" stroke-width="0.5" stroke-dasharray="4,2"/>';
      var lbl = Math.abs(yVal) >= 10000 ? (yVal / 10000).toFixed(1) + '\u4e07' : Math.round(yVal).toLocaleString();
      gridSvg += '<text x="' + (PL - 6) + '" y="' + (yPos + 3).toFixed(1) + '" text-anchor="end" font-size="9" fill="var(--text-tertiary)" font-family="var(--font-mono)">' + lbl + '</text>';
    }

    // Zero line
    if (minV < 0 && maxV > 0) {
      var zy = my(0);
      gridSvg += '<line x1="' + PL + '" y1="' + zy.toFixed(1) + '" x2="' + (W - PR) + '" y2="' + zy.toFixed(1) + '" stroke="var(--text-tertiary)" stroke-width="0.5" stroke-opacity="0.5"/>';
    }

    // X-axis labels
    var xSvg = '';
    xSvg += '<text x="' + mx(0).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="start" font-size="9" fill="var(--text-tertiary)" font-family="var(--font-mono)">' + data[0].dateStr + '</text>';
    xSvg += '<text x="' + mx(data.length - 1).toFixed(1) + '" y="' + (H - 4) + '" text-anchor="end" font-size="9" fill="var(--text-tertiary)" font-family="var(--font-mono)">' + data[data.length - 1].dateStr + '</text>';

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="pnl-chart-svg" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
        '<linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + chartColor + '" stop-opacity="0.3"/>' +
          '<stop offset="100%" stop-color="' + chartColor + '" stop-opacity="0.02"/>' +
        '</linearGradient>' +
      '</defs>' +
      gridSvg +
      '<path d="' + areaPath + '" fill="url(#pnlGrad)"/>' +
      '<path d="' + linePath + '" fill="none" stroke="' + chartColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      xSvg +
    '</svg>';

    // Chart header with total
    var headerHtml = '<div class="pnl-chart-header">' +
      '<span class="pnl-chart-label">\u640d\u76ca</span>' +
      '<span class="pnl-chart-total ' + (totalPnl >= 0 ? 'text-profit' : 'text-loss') + '">' + formatPnlJPY(totalPnl) + '</span>' +
    '</div>';

    container.innerHTML = headerHtml + svg;
  }

  function formatPnlJPY(val) {
    var prefix = val >= 0 ? '+' : '';
    return prefix + new Intl.NumberFormat('ja-JP').format(val) + ' JPY';
  }

  /* ---- Toast ---- */
  var toastTimer = null;

  function showToast(message) {
    var toast = document.getElementById('settingsToast');
    var msg = document.getElementById('toastMsg');
    if (!toast || !msg) return;

    msg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2500);
  }
})();
