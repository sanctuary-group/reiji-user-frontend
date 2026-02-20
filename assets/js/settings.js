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
    initCryptoHoldings();
    renderCryptoAllocationChart();
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
    if (typeof MOCK_CRYPTO_ALL === 'undefined') return null;
    for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
      if (MOCK_CRYPTO_ALL[i].symbol === symbol) return MOCK_CRYPTO_ALL[i];
    }
    return null;
  }

  function populateCurrencySelect() {
    var selectEl = document.getElementById('holdingCurrency');
    if (!selectEl || typeof MOCK_CRYPTO_ALL === 'undefined') return;

    var html = '<option value="">選択してください</option>';
    for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
      var coin = MOCK_CRYPTO_ALL[i];
      html += '<option value="' + coin.symbol + '">' + coin.symbol + ' - ' + coin.name + '</option>';
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
      html += '<div class="crypto-holding-item" data-index="' + i + '">' +
        '<div class="crypto-holding-display">' +
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
    if (typeof MOCK_CRYPTO_ALL === 'undefined') return '';
    var html = '';
    for (var i = 0; i < MOCK_CRYPTO_ALL.length; i++) {
      var coin = MOCK_CRYPTO_ALL[i];
      var sel = coin.symbol === selectedSymbol ? ' selected' : '';
      html += '<option value="' + coin.symbol + '"' + sel + '>' + coin.symbol + ' - ' + coin.name + '</option>';
    }
    return html;
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
      var color = CHART_COLORS[k % CHART_COLORS.length];
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
