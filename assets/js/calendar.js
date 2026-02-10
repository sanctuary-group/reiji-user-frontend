/**
 * Calendar - Render, navigation, and day detail modal
 */
(function () {
  var currentYear = 2026;
  var currentMonth = 2; // 1-indexed

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

  function openModal(day, dayData) {
    var title = currentYear + '年' + currentMonth + '月' + day + '日';
    document.getElementById('modalTitle').textContent = title;

    var bodyHtml = '';

    if (!dayData) {
      bodyHtml = '<div class="modal-no-data">この日の記録はありません</div>';
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
    }

    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('dayModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('dayModal').classList.remove('open');
    document.body.style.overflow = '';
  }
})();
