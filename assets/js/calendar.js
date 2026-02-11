/**
 * Calendar - Render, navigation, and day detail modal (view/edit)
 */
(function () {
  var currentYear = 2026;
  var currentMonth = 2; // 1-indexed
  var modalDay = null;  // currently open day number

  document.addEventListener('DOMContentLoaded', function () {
    startClock();
    renderCalendar();

    document.getElementById('prevMonth').addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      renderCalendar();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('dayModal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  });

  function startClock() {
    var el = document.getElementById('navDatetime');
    if (!el) return;

    var weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    function update() {
      var now = new Date();
      var y = now.getFullYear();
      var m = now.getMonth() + 1;
      var d = now.getDate();
      var w = weekdays[now.getDay()];
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      var ss = String(now.getSeconds()).padStart(2, '0');

      el.innerHTML =
        '<span class="nav-datetime-date">' + y + '/' + m + '/' + d + '(' + w + ')</span>' +
        '<span class="nav-datetime-time">' + hh + '時' + mm + '分' + ss + '秒</span>';
    }

    update();
    setInterval(update, 1000);
  }

  function renderCalendar() {
    var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    var data = MOCK_CALENDAR[key] || {};

    // Update title
    document.getElementById('calTitle').textContent = currentYear + '年' + currentMonth + '月';

    // Calculate month info
    var firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
    var daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    var today = new Date();
    var isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

    // Calculate summary
    var totalPnl = 0, winDays = 0, lossDays = 0;
    var catTotals = {};

    for (var d in data) {
      var entry = data[d];
      totalPnl += entry.total;
      if (entry.total > 0) winDays++;
      if (entry.total < 0) lossDays++;
      for (var c = 0; c < entry.categories.length; c++) {
        var cat = entry.categories[c];
        if (!catTotals[cat.id]) catTotals[cat.id] = 0;
        catTotals[cat.id] += cat.amount;
      }
    }

    // Render summary
    var summaryHtml =
      '<div class="cal-summary-item">合計: <span class="cal-summary-value ' + (totalPnl >= 0 ? 'profit' : 'loss') + '">' + formatYen(totalPnl) + '</span></div>' +
      '<div class="cal-summary-item">勝ち: <span class="cal-summary-value profit">' + winDays + '日</span></div>' +
      '<div class="cal-summary-item">負け: <span class="cal-summary-value loss">' + lossDays + '日</span></div>';
    document.getElementById('calSummary').innerHTML = summaryHtml;

    // Render category badges
    var catHtml = '';
    for (var i = 0; i < MOCK_CATEGORIES.length; i++) {
      var mc = MOCK_CATEGORIES[i];
      var amount = catTotals[mc.id] || 0;
      if (amount === 0) continue;
      catHtml += '<div class="cat-badge" style="background: var(--' + mc.colorVar + '-bg); color: var(--' + mc.colorVar + ');">' +
        '<span class="cat-badge-dot" style="background: var(--' + mc.colorVar + ');"></span>' +
        mc.name + ': <span class="cat-badge-amount">' + formatYen(amount) + '</span>' +
      '</div>';
    }
    document.getElementById('calCategories').innerHTML = catHtml;

    // Render calendar grid
    var gridHtml = '';
    // Previous month trailing days
    var prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (var p = firstDay - 1; p >= 0; p--) {
      gridHtml += '<div class="cal-day other-month"><span class="cal-day-number">' + (prevMonthDays - p) + '</span></div>';
    }

    // Current month days
    for (var day = 1; day <= daysInMonth; day++) {
      var dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
      var dayClass = 'cal-day';
      if (dayOfWeek === 0) dayClass += ' sun';
      if (dayOfWeek === 6) dayClass += ' sat';
      if (isCurrentMonth && day === today.getDate()) dayClass += ' today';

      var dayData = data[day];
      var pnlHtml = '';
      var dotsHtml = '';

      if (dayData) {
        var pnlClass = dayData.total >= 0 ? 'profit' : 'loss';
        pnlHtml = '<div class="cal-day-pnl ' + pnlClass + '">' + formatYen(dayData.total) + '</div>';

        dotsHtml = '<div class="cal-day-cats">';
        for (var ci = 0; ci < dayData.categories.length; ci++) {
          var catInfo = getCategoryById(dayData.categories[ci].id);
          if (catInfo) {
            dotsHtml += '<span class="cal-day-cat-dot" style="background: var(--' + catInfo.colorVar + ');" title="' + catInfo.name + '"></span>';
          }
        }
        dotsHtml += '</div>';
      }

      gridHtml += '<div class="' + dayClass + '" data-day="' + day + '">' +
        '<span class="cal-day-number">' + day + '</span>' +
        pnlHtml + dotsHtml +
      '</div>';
    }

    // Next month leading days
    var totalCells = firstDay + daysInMonth;
    var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (var n = 1; n <= remaining; n++) {
      gridHtml += '<div class="cal-day other-month"><span class="cal-day-number">' + n + '</span></div>';
    }

    var grid = document.getElementById('calGrid');
    grid.innerHTML = gridHtml;

    // Add click listeners to current month days
    grid.querySelectorAll('.cal-day:not(.other-month)').forEach(function (cell) {
      cell.addEventListener('click', function () {
        var day = parseInt(this.getAttribute('data-day'));
        openModal(day, data[day]);
      });
    });
  }

  /* ---- Modal ---- */

  function openModal(day, dayData) {
    modalDay = day;
    var title = currentYear + '年' + currentMonth + '月' + day + '日';
    document.getElementById('modalTitle').textContent = title;
    showViewMode(day, dayData);
    document.getElementById('dayModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('dayModal').classList.remove('open');
    document.body.style.overflow = '';
    modalDay = null;
  }

  /* ---- View Mode ---- */

  function showViewMode(day, dayData) {
    var bodyHtml = '';

    if (!dayData) {
      bodyHtml = '<div class="modal-no-data">この日の記録はありません</div>' +
        '<div class="modal-view-btn-wrap">' +
          '<button class="btn btn-primary modal-view-btn" id="modalEditBtn">' +
            '<i class="fa-solid fa-plus"></i> 記録を追加' +
          '</button>' +
        '</div>';
    } else {
      // Total
      var totalClass = dayData.total >= 0 ? 'text-profit' : 'text-loss';
      bodyHtml += '<div class="modal-day-total">' +
        '<div class="modal-day-total-label">日次損益</div>' +
        '<div class="modal-day-total-value ' + totalClass + '">' + formatYen(dayData.total) + '</div>' +
      '</div>';

      // Category breakdown
      bodyHtml += '<div class="modal-cat-list">';
      for (var i = 0; i < dayData.categories.length; i++) {
        var cat = dayData.categories[i];
        var catInfo = getCategoryById(cat.id);
        var amtClass = cat.amount >= 0 ? 'text-profit' : 'text-loss';
        bodyHtml += '<div class="modal-cat-item">' +
          '<span class="modal-cat-name">' +
            '<span class="cal-day-cat-dot" style="background: var(--' + (catInfo ? catInfo.colorVar : 'color-primary') + ');"></span>' +
            (catInfo ? catInfo.name : cat.id) +
          '</span>' +
          '<span class="modal-cat-amount ' + amtClass + '">' + formatYen(cat.amount) + '</span>' +
        '</div>';
      }
      bodyHtml += '</div>';

      // Comment
      if (dayData.comment) {
        bodyHtml += '<div class="modal-comment">' +
          '<div class="modal-comment-label">メモ</div>' +
          dayData.comment +
        '</div>';
      }

      // Edit button
      bodyHtml += '<div class="modal-view-btn-wrap">' +
        '<button class="btn btn-secondary modal-view-btn" id="modalEditBtn">' +
          '<i class="fa-solid fa-pen"></i> 編集' +
        '</button>' +
      '</div>';
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;

    // Bind edit button
    document.getElementById('modalEditBtn').addEventListener('click', function () {
      showEditMode(day, dayData);
    });
  }

  /* ---- Edit Mode ---- */

  function showEditMode(day, dayData) {
    // Build lookup of existing category amounts
    var existingAmounts = {};
    if (dayData) {
      for (var i = 0; i < dayData.categories.length; i++) {
        existingAmounts[dayData.categories[i].id] = dayData.categories[i].amount;
      }
    }

    var html = '<div class="modal-edit-section">' +
      '<div class="modal-edit-label">カテゴリを選択:</div>' +
      '<div class="modal-edit-cats">';

    for (var c = 0; c < MOCK_CATEGORIES.length; c++) {
      var mc = MOCK_CATEGORIES[c];
      var hasData = existingAmounts.hasOwnProperty(mc.id);
      var amount = hasData ? existingAmounts[mc.id] : '';
      var checked = hasData ? ' checked' : '';
      var disabled = hasData ? '' : ' disabled';

      html += '<label class="modal-edit-cat-row">' +
        '<input type="checkbox" class="modal-edit-check" data-cat="' + mc.id + '"' + checked + '>' +
        '<span class="modal-edit-cat-dot" style="background: var(--' + mc.colorVar + ');"></span>' +
        '<span class="modal-edit-cat-name">' + mc.name + '</span>' +
        '<input type="number" class="form-input modal-edit-amount" data-cat="' + mc.id + '"' +
          ' placeholder="0" value="' + (hasData ? amount : '') + '"' + disabled + '>' +
        '<span class="modal-edit-unit">円</span>' +
      '</label>';
    }

    html += '</div>' +
      '<div class="modal-edit-total">' +
        '<span class="modal-edit-total-label">合計</span>' +
        '<span class="modal-edit-total-value" id="editTotal">' + formatYen(dayData ? dayData.total : 0) + '</span>' +
      '</div>' +
    '</div>';

    // Action buttons
    html += '<div class="modal-edit-actions">' +
      '<button class="btn btn-secondary" id="editCancel">キャンセル</button>' +
      '<button class="btn btn-primary" id="editSave">保存する</button>' +
    '</div>';

    document.getElementById('modalBody').innerHTML = html;

    // Bind checkbox toggle
    var checks = document.querySelectorAll('.modal-edit-check');
    var amounts = document.querySelectorAll('.modal-edit-amount');

    checks.forEach(function (cb) {
      cb.addEventListener('change', function () {
        var catId = this.getAttribute('data-cat');
        var input = document.querySelector('.modal-edit-amount[data-cat="' + catId + '"]');
        if (this.checked) {
          input.disabled = false;
          input.focus();
        } else {
          input.disabled = true;
          input.value = '';
        }
        updateEditTotal();
      });
    });

    amounts.forEach(function (input) {
      input.addEventListener('input', function () {
        updateEditTotal();
      });
    });

    // Cancel
    document.getElementById('editCancel').addEventListener('click', function () {
      var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
      var data = MOCK_CALENDAR[key] || {};
      showViewMode(day, data[day]);
    });

    // Save
    document.getElementById('editSave').addEventListener('click', function () {
      saveEntry(day);
    });
  }

  function updateEditTotal() {
    var total = 0;
    var checks = document.querySelectorAll('.modal-edit-check');
    checks.forEach(function (cb) {
      if (!cb.checked) return;
      var catId = cb.getAttribute('data-cat');
      var input = document.querySelector('.modal-edit-amount[data-cat="' + catId + '"]');
      var val = parseFloat(input.value);
      if (!isNaN(val)) total += val;
    });

    var el = document.getElementById('editTotal');
    var cls = total >= 0 ? 'text-profit' : 'text-loss';
    el.className = 'modal-edit-total-value ' + cls;
    el.textContent = formatYen(total);
  }

  function saveEntry(day) {
    var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
    if (!MOCK_CALENDAR[key]) MOCK_CALENDAR[key] = {};

    var categories = [];
    var total = 0;
    var checks = document.querySelectorAll('.modal-edit-check');

    checks.forEach(function (cb) {
      if (!cb.checked) return;
      var catId = cb.getAttribute('data-cat');
      var input = document.querySelector('.modal-edit-amount[data-cat="' + catId + '"]');
      var val = parseFloat(input.value) || 0;
      categories.push({ id: catId, amount: val });
      total += val;
    });

    if (categories.length === 0) {
      // No categories selected — remove entry
      delete MOCK_CALENDAR[key][day];
    } else {
      // Preserve existing comment if any
      var existing = MOCK_CALENDAR[key][day];
      var comment = existing ? existing.comment : '';
      MOCK_CALENDAR[key][day] = {
        total: total,
        categories: categories,
        comment: comment
      };
    }

    // Re-render calendar grid
    renderCalendar();

    // Show updated view mode
    var data = MOCK_CALENDAR[key] || {};
    showViewMode(day, data[day]);
  }
})();
