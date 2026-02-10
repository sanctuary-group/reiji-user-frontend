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
