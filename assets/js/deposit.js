/**
 * Deposit - 口座入出金管理
 * Uses API: GET/POST/PUT/DELETE /api/deposits
 */
(function () {
  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth() + 1;

  document.addEventListener('DOMContentLoaded', function () {
    renderPage();
    initNavigation();
    initModal();
  });

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

    apiFetch('/api/deposits?year=' + currentYear + '&month=' + currentMonth)
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        renderKpi({
          balance: data.balance,
          monthDeposits: data.monthDeposits,
          monthWithdrawals: data.monthWithdrawals,
          monthDepositCount: 0,
          monthWithdrawalCount: 0
        });
        renderTable(data.records || []);
      })
      .catch(function () {
        renderFromMock();
      });
  }

  /* ---- Mock fallback ---- */
  function renderFromMock() {
    if (typeof MOCK_DEPOSITS === 'undefined') {
      renderKpi({ balance: 0, monthDeposits: 0, monthWithdrawals: 0, monthDepositCount: 0, monthWithdrawalCount: 0 });
      renderTable([]);
      return;
    }

    var mm = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
    var key = currentYear + '-' + mm;
    var entries = [];

    for (var i = 0; i < MOCK_DEPOSITS.length; i++) {
      var entry = MOCK_DEPOSITS[i];
      if (entry.date.substring(0, 7) === key) {
        entries.push(entry);
      }
    }

    entries.sort(function (a, b) {
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return b.id - a.id;
    });

    var monthDeposits = 0, monthWithdrawals = 0;
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].type === 'deposit') monthDeposits += entries[j].amount;
      else monthWithdrawals += entries[j].amount;
    }

    var totalDeposits = 0, totalWithdrawals = 0;
    for (var k = 0; k < MOCK_DEPOSITS.length; k++) {
      if (MOCK_DEPOSITS[k].type === 'deposit') totalDeposits += MOCK_DEPOSITS[k].amount;
      else totalWithdrawals += MOCK_DEPOSITS[k].amount;
    }

    renderKpi({
      balance: totalDeposits - totalWithdrawals,
      monthDeposits: monthDeposits,
      monthWithdrawals: monthWithdrawals,
      monthDepositCount: 0,
      monthWithdrawalCount: 0
    });
    renderTable(entries);
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
        sub: ''
      },
      {
        icon: '<i class="fa-solid fa-arrow-up"></i>',
        value: new Intl.NumberFormat('ja-JP').format(stats.monthWithdrawals) + '円',
        cls: 'text-loss',
        label: '出金合計',
        sub: ''
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
        '<td class="dep-td">' + (e.account || '-') + '</td>' +
        '<td class="dep-td">' + (e.method || '-') + '</td>' +
        '<td class="dep-td dep-td-memo">' + (e.memo || '-') + '</td>' +
      '</tr>';
    }
    tbody.innerHTML = html;
  }

  /* ---- Helpers ---- */
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
        '<input type="text" class="form-input" id="depAccount" placeholder="例: SBI証券、楽天銀行">' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="depMethod">方法</label>' +
        '<input type="text" class="form-input" id="depMethod" placeholder="例: 銀行振込、クレジットカード">' +
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
    var amount = parseInt(document.getElementById('depAmount').value) || 0;
    var account = document.getElementById('depAccount').value.trim();
    var method = document.getElementById('depMethod').value.trim();
    var memo = document.getElementById('depMemo').value.trim();

    if (!date || amount <= 0 || !account || !method) {
      return;
    }

    var body = {
      date: date,
      type: type,
      amount: amount,
      account: account,
      method: method,
      memo: memo || null
    };

    apiFetch('/api/deposits', { method: 'POST', body: body })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function () {
        closeModal();
        renderPage();
      })
      .catch(function () {
        // Fallback: add to mock data
        if (typeof MOCK_DEPOSITS !== 'undefined') {
          MOCK_DEPOSITS.push({
            id: Date.now(),
            date: date,
            type: type,
            amount: amount,
            account: account,
            method: method,
            memo: memo
          });
        }
        closeModal();
        renderPage();
      });
  }
})();
