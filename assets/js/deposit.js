/**
 * Deposit - 口座入出金管理
 * Month navigation, KPI cards, table rendering, add entry modal
 */
(function () {
  var currentYear = 2026;
  var currentMonth = 2;
  var nextId = 100;

  document.addEventListener('DOMContentLoaded', function () {
    calcNextId();
    renderPage();
    initNavigation();
    initModal();
  });

  /* ---- Calculate next available ID ---- */
  function calcNextId() {
    var maxId = 0;
    for (var i = 0; i < MOCK_DEPOSITS.length; i++) {
      if (MOCK_DEPOSITS[i].id > maxId) {
        maxId = MOCK_DEPOSITS[i].id;
      }
    }
    nextId = maxId + 1;
  }

  /* ---- Navigation ---- */
  function initNavigation() {
    document.getElementById('prevMonth').addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      renderPage();
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      renderPage();
    });
  }

  /* ---- Main Page Render ---- */
  function renderPage() {
    document.getElementById('depTitle').textContent = currentYear + '年' + currentMonth + '月';

    var entries = getMonthEntries();
    var stats = calcStats(entries);

    renderKpi(stats);
    renderTable(entries);
  }

  /* ---- Filter entries for current month ---- */
  function getMonthEntries() {
    var mm = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
    var key = currentYear + '-' + mm;
    var result = [];

    for (var i = 0; i < MOCK_DEPOSITS.length; i++) {
      var entry = MOCK_DEPOSITS[i];
      if (entry.date.substring(0, 7) === key) {
        result.push(entry);
      }
    }

    result.sort(function (a, b) {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return b.id - a.id;
    });

    return result;
  }

  /* ---- Calculate summary stats ---- */
  function calcStats(entries) {
    var monthDeposits = 0;
    var monthWithdrawals = 0;
    var monthDepositCount = 0;
    var monthWithdrawalCount = 0;

    for (var i = 0; i < entries.length; i++) {
      if (entries[i].type === 'deposit') {
        monthDeposits += entries[i].amount;
        monthDepositCount++;
      } else {
        monthWithdrawals += entries[i].amount;
        monthWithdrawalCount++;
      }
    }

    var totalDeposits = 0;
    var totalWithdrawals = 0;
    for (var j = 0; j < MOCK_DEPOSITS.length; j++) {
      if (MOCK_DEPOSITS[j].type === 'deposit') {
        totalDeposits += MOCK_DEPOSITS[j].amount;
      } else {
        totalWithdrawals += MOCK_DEPOSITS[j].amount;
      }
    }

    return {
      balance: totalDeposits - totalWithdrawals,
      monthDeposits: monthDeposits,
      monthWithdrawals: monthWithdrawals,
      monthDepositCount: monthDepositCount,
      monthWithdrawalCount: monthWithdrawalCount
    };
  }

  /* ---- Render KPI Cards ---- */
  function renderKpi(stats) {
    var container = document.getElementById('depKpi');
    if (!container) return;

    var balanceClass = stats.balance >= 0 ? 'text-profit' : 'text-loss';

    var kpis = [
      {
        icon: '<i class="fa-solid fa-wallet"></i>',
        value: new Intl.NumberFormat('ja-JP').format(stats.balance) + '円',
        cls: balanceClass,
        label: '残高',
        sub: '全期間累計'
      },
      {
        icon: '<i class="fa-solid fa-arrow-down"></i>',
        value: new Intl.NumberFormat('ja-JP').format(stats.monthDeposits) + '円',
        cls: 'text-profit',
        label: '入金合計',
        sub: stats.monthDepositCount + '件'
      },
      {
        icon: '<i class="fa-solid fa-arrow-up"></i>',
        value: new Intl.NumberFormat('ja-JP').format(stats.monthWithdrawals) + '円',
        cls: 'text-loss',
        label: '出金合計',
        sub: stats.monthWithdrawalCount + '件'
      }
    ];

    var html = '';
    for (var i = 0; i < kpis.length; i++) {
      var k = kpis[i];
      html += '<div class="dep-kpi">' +
        '<div class="dep-kpi-icon">' + k.icon + '</div>' +
        '<div class="dep-kpi-value ' + k.cls + '">' + k.value + '</div>' +
        '<div class="dep-kpi-label">' + k.label + '</div>' +
        '<div class="dep-kpi-sub">' + k.sub + '</div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  /* ---- Render Table ---- */
  function renderTable(entries) {
    var tbody = document.getElementById('depTableBody');
    var emptyEl = document.getElementById('depEmpty');
    if (!tbody) return;

    if (entries.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.classList.add('visible');
      return;
    }

    if (emptyEl) emptyEl.classList.remove('visible');

    var html = '';
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var typeLabel = e.type === 'deposit' ? '入金' : '出金';
      var typeBadge = e.type === 'deposit' ? 'dep-badge-deposit' : 'dep-badge-withdrawal';
      var amountClass = e.type === 'deposit' ? 'text-profit' : 'text-loss';
      var amountSign = e.type === 'deposit' ? '+' : '-';

      html += '<tr class="dep-tr">' +
        '<td class="dep-td dep-td-date">' + formatDate(e.date) + '</td>' +
        '<td class="dep-td"><span class="' + typeBadge + '">' + typeLabel + '</span></td>' +
        '<td class="dep-td dep-td-amount ' + amountClass + '">' + amountSign + formatAmount(e.amount) + '</td>' +
        '<td class="dep-td">' + getAccountName(e.account) + '</td>' +
        '<td class="dep-td">' + getMethodName(e.method) + '</td>' +
        '<td class="dep-td dep-td-memo">' + (e.memo || '-') + '</td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }

  /* ---- Helpers ---- */
  function getAccountName(id) {
    for (var i = 0; i < MOCK_ACCOUNTS.length; i++) {
      if (MOCK_ACCOUNTS[i].id === id) return MOCK_ACCOUNTS[i].name;
    }
    return id;
  }

  function getMethodName(id) {
    for (var i = 0; i < MOCK_METHODS.length; i++) {
      if (MOCK_METHODS[i].id === id) return MOCK_METHODS[i].name;
    }
    return id;
  }

  function formatDate(dateStr) {
    var parts = dateStr.split('-');
    return parseInt(parts[1], 10) + '/' + parseInt(parts[2], 10);
  }

  function formatAmount(amount) {
    return new Intl.NumberFormat('ja-JP').format(amount) + '円';
  }

  /* ---- Modal ---- */
  function initModal() {
    document.getElementById('addEntry').addEventListener('click', function () {
      openModal();
    });

    document.getElementById('depModalClose').addEventListener('click', closeModal);

    document.getElementById('depModal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var modal = document.getElementById('depModal');
        if (modal.classList.contains('open')) {
          closeModal();
        }
      }
    });
  }

  function openModal() {
    renderModalForm();
    document.getElementById('depModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('depModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderModalForm() {
    var mm = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
    var dd = new Date().getDate();
    var dayStr = dd < 10 ? '0' + dd : '' + dd;
    var today = currentYear + '-' + mm + '-' + dayStr;

    var accountOptions = '<option value="">選択してください</option>';
    for (var i = 0; i < MOCK_ACCOUNTS.length; i++) {
      accountOptions += '<option value="' + MOCK_ACCOUNTS[i].id + '">' + MOCK_ACCOUNTS[i].name + '</option>';
    }

    var methodOptions = '<option value="">選択してください</option>';
    for (var j = 0; j < MOCK_METHODS.length; j++) {
      methodOptions += '<option value="' + MOCK_METHODS[j].id + '">' + MOCK_METHODS[j].name + '</option>';
    }

    var html = '<div class="dep-form">' +
      '<div class="form-group">' +
        '<label class="form-label">種別</label>' +
        '<div class="dep-type-toggle">' +
          '<button class="dep-type-btn active" data-type="deposit">入金</button>' +
          '<button class="dep-type-btn" data-type="withdrawal">出金</button>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depDate">日付</label>' +
        '<input type="date" class="form-input" id="depDate" value="' + today + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depAmount">金額</label>' +
        '<div class="dep-amount-wrap">' +
          '<input type="number" class="form-input dep-amount-input" id="depAmount" placeholder="0" min="0">' +
          '<span class="dep-amount-unit">円</span>' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depAccount">口座</label>' +
        '<select class="form-input" id="depAccount">' + accountOptions + '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depMethod">方法</label>' +
        '<select class="form-input" id="depMethod">' + methodOptions + '</select>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depMemo">メモ</label>' +
        '<input type="text" class="form-input" id="depMemo" placeholder="任意のメモ">' +
      '</div>' +
      '<div class="dep-modal-actions">' +
        '<button class="btn btn-secondary" id="depCancel">キャンセル</button>' +
        '<button class="btn btn-primary" id="depSave">保存する</button>' +
      '</div>' +
    '</div>';

    document.getElementById('depModalBody').innerHTML = html;

    initTypeToggle();

    document.getElementById('depCancel').addEventListener('click', closeModal);

    document.getElementById('depSave').addEventListener('click', function () {
      saveEntry();
    });
  }

  function initTypeToggle() {
    var btns = document.querySelectorAll('.dep-type-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        for (var j = 0; j < btns.length; j++) {
          btns[j].classList.remove('active');
        }
        this.classList.add('active');
      });
    }
  }

  function saveEntry() {
    var activeBtn = document.querySelector('.dep-type-btn.active');
    var type = activeBtn ? activeBtn.getAttribute('data-type') : 'deposit';

    var date = document.getElementById('depDate').value;
    var amount = parseFloat(document.getElementById('depAmount').value) || 0;
    var account = document.getElementById('depAccount').value;
    var method = document.getElementById('depMethod').value;
    var memo = document.getElementById('depMemo').value;

    if (!date || amount <= 0 || !account || !method) {
      return;
    }

    var newEntry = {
      id: nextId++,
      date: date,
      type: type,
      amount: amount,
      account: account,
      method: method,
      memo: memo
    };

    MOCK_DEPOSITS.push(newEntry);

    closeModal();
    renderPage();
  }
})();
