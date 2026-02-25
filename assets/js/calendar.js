/**
 * Calendar - Render, navigation, and day detail modal (view/edit)
 * Uses API: GET/POST /api/pnl/calendar, GET /api/pnl/categories
 */
(function () {
  var now = new Date();
  var currentYear = now.getFullYear();
  var currentMonth = now.getMonth() + 1;
  var modalDay = null;

  // Fetched data
  var calendarData = {};
  var calCategories = [];

  var onboardStep = 0;
  var totalOnboardSteps = 3;

  var ONBOARD_STEPS = [
    {
      text: '記録したい日付をクリックして、損益を記録しましょう',
      getTarget: function () {
        return document.querySelector('.cal-day.today') ||
               document.querySelector('.cal-day:not(.other-month)');
      },
      arrowPos: 'top'
    },
    {
      text: 'ここから記録の追加・編集ができます',
      getTarget: function () {
        return document.getElementById('modalEditBtn');
      },
      arrowPos: 'top'
    },
    {
      text: 'カテゴリを選んで金額を入力し、保存しましょう',
      getTarget: function () {
        return document.querySelector('.modal-edit-cats') ||
               document.querySelector('.modal-edit-section');
      },
      arrowPos: 'top'
    }
  ];

  document.addEventListener('DOMContentLoaded', function () {
    startClock();
    fetchAndRender();

    document.getElementById('prevMonth').addEventListener('click', function () {
      currentMonth--;
      if (currentMonth < 1) { currentMonth = 12; currentYear--; }
      fetchAndRender();
    });

    document.getElementById('nextMonth').addEventListener('click', function () {
      currentMonth++;
      if (currentMonth > 12) { currentMonth = 1; currentYear++; }
      fetchAndRender();
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('dayModal').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (document.getElementById('onboardOverlay').classList.contains('active')) {
          endOnboarding();
        } else {
          closeModal();
        }
      }
    });

    // Onboarding buttons
    document.getElementById('onboardSkip').addEventListener('click', function () {
      endOnboarding();
    });
    document.getElementById('onboardNext').addEventListener('click', function () {
      nextOnboardStep();
    });

    // Start onboarding after a short delay
    setTimeout(function () {
      startOnboarding();
    }, 800);
  });

  function fetchAndRender() {
    apiFetch('/api/pnl/calendar?year=' + currentYear + '&month=' + currentMonth)
      .then(function (res) {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(function (json) {
        calendarData = json.data || {};
        calCategories = json.categories || [];
        renderCalendar();
      })
      .catch(function () {
        // Fallback to mock data if available
        var key = currentYear + '-' + String(currentMonth).padStart(2, '0');
        calendarData = (typeof MOCK_CALENDAR !== 'undefined' && MOCK_CALENDAR[key]) ? MOCK_CALENDAR[key] : {};
        calCategories = (typeof MOCK_CATEGORIES !== 'undefined') ? MOCK_CATEGORIES : [];
        renderCalendar();
      });
  }

  function getCatById(id) {
    for (var i = 0; i < calCategories.length; i++) {
      if (calCategories[i].id === id) return calCategories[i];
    }
    return null;
  }

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
    var data = calendarData;

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
        var catId = cat.id;
        if (!catTotals[catId]) catTotals[catId] = 0;
        catTotals[catId] += cat.amount;
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
    for (var i = 0; i < calCategories.length; i++) {
      var mc = calCategories[i];
      var amount = catTotals[mc.id] || 0;
      if (amount === 0) continue;
      catHtml += '<div class="cat-badge" style="background: ' + mc.color + '20; color: ' + mc.color + ';">' +
        '<span class="cat-badge-dot" style="background: ' + mc.color + ';"></span>' +
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
          var catInfo = getCatById(dayData.categories[ci].id);
          if (catInfo) {
            dotsHtml += '<span class="cal-day-cat-dot" style="background: ' + catInfo.color + ';" title="' + catInfo.name + '"></span>';
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
        var catInfo = getCatById(cat.id);
        var amtClass = cat.amount >= 0 ? 'text-profit' : 'text-loss';
        var dotColor = catInfo ? catInfo.color : 'var(--color-primary)';
        bodyHtml += '<div class="modal-cat-item">' +
          '<span class="modal-cat-name">' +
            '<span class="cal-day-cat-dot" style="background: ' + dotColor + ';"></span>' +
            (catInfo ? catInfo.name : 'カテゴリ') +
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

    for (var c = 0; c < calCategories.length; c++) {
      var mc = calCategories[c];
      var hasData = existingAmounts.hasOwnProperty(mc.id);
      var amount = hasData ? existingAmounts[mc.id] : '';
      var checked = hasData ? ' checked' : '';
      var disabled = hasData ? '' : ' disabled';

      html += '<label class="modal-edit-cat-row">' +
        '<input type="checkbox" class="modal-edit-check" data-cat="' + mc.id + '"' + checked + '>' +
        '<span class="modal-edit-cat-dot" style="background: ' + mc.color + ';"></span>' +
        '<span class="modal-edit-cat-name">' + mc.name + '</span>' +
        '<input type="number" class="form-input modal-edit-amount" data-cat="' + mc.id + '"' +
          ' placeholder="0" value="' + (hasData ? amount : '') + '"' + disabled + '>' +
        '<span class="modal-edit-unit">円</span>' +
      '</label>';
    }

    html += '</div>' +
      '<div class="modal-edit-comment">' +
        '<label class="modal-edit-label" for="editComment">メモ:</label>' +
        '<input type="text" class="form-input" id="editComment" placeholder="メモを入力" maxlength="500" value="' + (dayData && dayData.comment ? dayData.comment : '') + '">' +
      '</div>' +
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
      showViewMode(day, calendarData[day]);
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
    var categories = [];
    var checks = document.querySelectorAll('.modal-edit-check');

    checks.forEach(function (cb) {
      if (!cb.checked) return;
      var catId = parseInt(cb.getAttribute('data-cat'));
      var input = document.querySelector('.modal-edit-amount[data-cat="' + catId + '"]');
      var val = parseFloat(input.value) || 0;
      categories.push({ category_id: catId, amount: val });
    });

    var commentEl = document.getElementById('editComment');
    var comment = commentEl ? commentEl.value.trim() : '';

    var dateStr = currentYear + '-' + String(currentMonth).padStart(2, '0') + '-' + String(day).padStart(2, '0');

    var saveBtn = document.getElementById('editSave');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    apiFetch('/api/pnl/calendar', {
      method: 'POST',
      body: {
        date: dateStr,
        categories: categories,
        comment: comment || null
      }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Save failed');
      return res.json();
    })
    .then(function () {
      // Re-fetch and render
      fetchAndRender();
      // Update view in modal after data loads
      setTimeout(function () {
        showViewMode(day, calendarData[day]);
      }, 300);
    })
    .catch(function () {
      alert('保存に失敗しました');
      saveBtn.disabled = false;
      saveBtn.textContent = '保存する';
    });
  }

  /* ---- Onboarding Guide ---- */

  function startOnboarding() {
    if (localStorage.getItem('cal_onboarding_done')) return;

    onboardStep = 0;
    document.body.classList.add('onboard-active');
    document.getElementById('onboardOverlay').classList.add('active');
    showOnboardStep(0);
  }

  function showOnboardStep(step) {
    onboardStep = step;
    var config = ONBOARD_STEPS[step];
    var target = config.getTarget();
    if (!target) { endOnboarding(); return; }

    // Clear previous spotlight
    var prev = document.querySelector('.onboard-spotlight');
    if (prev) prev.classList.remove('onboard-spotlight');

    // Add spotlight to target
    target.classList.add('onboard-spotlight');

    // Update tooltip text
    document.getElementById('onboardText').textContent = config.text;

    // Update step dots
    var dotsHtml = '';
    for (var i = 0; i < totalOnboardSteps; i++) {
      dotsHtml += '<span class="onboard-dot' + (i === step ? ' active' : '') + '"></span>';
    }
    document.getElementById('onboardDots').innerHTML = dotsHtml;

    // Update button text
    var nextBtn = document.getElementById('onboardNext');
    if (step === totalOnboardSteps - 1) {
      nextBtn.textContent = 'はじめる';
    } else {
      nextBtn.textContent = '次へ';
    }

    // Position tooltip
    positionTooltip(target, config.arrowPos);

    // Show tooltip
    document.getElementById('onboardTooltip').classList.add('active');
  }

  function positionTooltip(target, arrowPos) {
    var tooltip = document.getElementById('onboardTooltip');
    var arrow = document.getElementById('onboardArrow');
    var rect = target.getBoundingClientRect();

    // Reset classes
    arrow.className = 'onboard-tooltip-arrow';

    // Calculate position
    var tooltipWidth = 340;
    var gap = 16;

    // Place below or above the target
    var top, left;

    if (arrowPos === 'top') {
      // Tooltip below target, arrow on top
      top = rect.bottom + gap;
      arrow.classList.add('top');
    } else {
      // Tooltip above target, arrow on bottom
      top = rect.top - gap;
      arrow.classList.add('bottom');
    }

    // Center horizontally relative to target
    left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

    // Keep within viewport
    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;
    if (left < 12) left = 12;
    if (left + tooltipWidth > viewWidth - 12) left = viewWidth - tooltipWidth - 12;

    // If tooltip goes below viewport, place above instead
    if (arrowPos === 'top' && top + 180 > viewHeight) {
      top = rect.top - 180 - gap;
      arrow.className = 'onboard-tooltip-arrow bottom';
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';

    // Adjust arrow horizontal position to point at target center
    var arrowLeft = rect.left + (rect.width / 2) - left;
    arrowLeft = Math.max(20, Math.min(arrowLeft, tooltipWidth - 20));
    arrow.style.left = arrowLeft + 'px';
    arrow.style.marginLeft = '0';
  }

  function nextOnboardStep() {
    var nextStep = onboardStep + 1;

    if (nextStep >= totalOnboardSteps) {
      endOnboarding();
      return;
    }

    // Clear current spotlight
    var prev = document.querySelector('.onboard-spotlight');
    if (prev) prev.classList.remove('onboard-spotlight');
    document.getElementById('onboardTooltip').classList.remove('active');

    if (nextStep === 1) {
      // Step 2: Open modal on a target day
      var targetCell = document.querySelector('.cal-day.today') ||
                       document.querySelector('.cal-day:not(.other-month)');
      if (targetCell) {
        var day = parseInt(targetCell.getAttribute('data-day'));
        openModal(day, calendarData[day]);
      }

      // Wait for modal to render, then show step
      setTimeout(function () {
        showOnboardStep(1);
      }, 350);
    } else if (nextStep === 2) {
      // Step 3: Click edit button to show edit mode
      var editBtn = document.getElementById('modalEditBtn');
      if (editBtn) editBtn.click();

      // Wait for edit mode to render
      setTimeout(function () {
        showOnboardStep(2);
      }, 350);
    }
  }

  function endOnboarding() {
    // Clear spotlight
    var prev = document.querySelector('.onboard-spotlight');
    if (prev) prev.classList.remove('onboard-spotlight');

    // Hide overlay and tooltip
    document.getElementById('onboardOverlay').classList.remove('active');
    document.getElementById('onboardTooltip').classList.remove('active');
    document.body.classList.remove('onboard-active');

    // Close modal if open
    closeModal();

    // Save to localStorage
    localStorage.setItem('cal_onboarding_done', '1');
  }
})();
