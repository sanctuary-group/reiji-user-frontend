/**
 * Simple Calculator Modal
 * 四則演算 + % 計算対応の投資向け簡易電卓
 */
(function () {
  'use strict';

  /* ---- State ---- */
  var currentValue = '0';
  var previousValue = '';
  var operator = '';
  var shouldResetDisplay = false;
  var expression = '';

  /* ---- DOM refs ---- */
  var modal, displayValue, displayExpr, closeBtn;

  /* ---- Format display value ---- */
  function formatDisplay(val) {
    if (val === 'エラー') return val;
    var num = parseFloat(val);
    if (isNaN(num)) return '0';
    // If the value has a trailing dot or trailing zeros after dot, keep as-is
    if (val.indexOf('.') !== -1 && (val.charAt(val.length - 1) === '.' || /\.\d*0+$/.test(val))) {
      var parts = val.split('.');
      var intPart = parseInt(parts[0], 10);
      var formatted = intPart.toLocaleString();
      return formatted + '.' + parts[1];
    }
    // Round to avoid floating point issues
    var rounded = parseFloat(num.toPrecision(12));
    return rounded.toLocaleString('ja-JP', { maximumFractionDigits: 10 });
  }

  /* ---- Update display ---- */
  function updateDisplay() {
    if (!displayValue) return;
    displayValue.textContent = formatDisplay(currentValue);
    if (currentValue === 'エラー') {
      displayValue.classList.add('error');
    } else {
      displayValue.classList.remove('error');
    }
    displayExpr.textContent = expression;

    // Highlight active operator button
    var opBtns = modal.querySelectorAll('.calc-btn-op');
    for (var i = 0; i < opBtns.length; i++) {
      var btnOp = opBtns[i].getAttribute('data-op');
      if (operator && btnOp === operator && shouldResetDisplay) {
        opBtns[i].classList.add('active');
      } else {
        opBtns[i].classList.remove('active');
      }
    }
  }

  /* ---- Calculate ---- */
  function calculate(a, op, b) {
    var numA = parseFloat(a);
    var numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) return 'エラー';
    var result;
    switch (op) {
      case '+': result = numA + numB; break;
      case '-': result = numA - numB; break;
      case '×': result = numA * numB; break;
      case '÷':
        if (numB === 0) return 'エラー';
        result = numA / numB;
        break;
      default: return 'エラー';
    }
    // Round to 12 significant digits to avoid floating point errors
    return String(parseFloat(result.toPrecision(12)));
  }

  /* ---- Input handlers ---- */
  function inputDigit(digit) {
    if (currentValue === 'エラー') {
      currentValue = digit;
      expression = '';
      return;
    }
    if (shouldResetDisplay) {
      currentValue = digit;
      shouldResetDisplay = false;
    } else {
      // Max 12 digits
      var digits = currentValue.replace(/[^0-9]/g, '');
      if (digits.length >= 12) return;
      currentValue = currentValue === '0' ? digit : currentValue + digit;
    }
  }

  function inputDecimal() {
    if (currentValue === 'エラー') {
      currentValue = '0.';
      expression = '';
      shouldResetDisplay = false;
      return;
    }
    if (shouldResetDisplay) {
      currentValue = '0.';
      shouldResetDisplay = false;
      return;
    }
    if (currentValue.indexOf('.') === -1) {
      currentValue += '.';
    }
  }

  function inputOperator(op) {
    if (currentValue === 'エラー') return;
    var currentNum = formatDisplay(currentValue);
    if (operator && !shouldResetDisplay) {
      // Chain calculation
      var result = calculate(previousValue, operator, currentValue);
      expression = formatDisplay(result) + ' ' + op;
      previousValue = result;
      currentValue = result;
    } else {
      expression = currentNum + ' ' + op;
      previousValue = currentValue;
    }
    operator = op;
    shouldResetDisplay = true;
  }

  function inputEquals() {
    if (currentValue === 'エラー') return;
    if (!operator || !previousValue) return;
    var result = calculate(previousValue, operator, currentValue);
    expression = formatDisplay(previousValue) + ' ' + operator + ' ' + formatDisplay(currentValue) + ' =';
    currentValue = result;
    previousValue = '';
    operator = '';
    shouldResetDisplay = true;
  }

  function inputPercent() {
    if (currentValue === 'エラー') return;
    var num = parseFloat(currentValue);
    if (isNaN(num)) return;
    currentValue = String(parseFloat((num / 100).toPrecision(12)));
    shouldResetDisplay = true;
  }

  function inputNegate() {
    if (currentValue === 'エラー' || currentValue === '0') return;
    if (currentValue.charAt(0) === '-') {
      currentValue = currentValue.substring(1);
    } else {
      currentValue = '-' + currentValue;
    }
  }

  function inputBackspace() {
    if (currentValue === 'エラー') {
      clearAll();
      return;
    }
    if (shouldResetDisplay) return;
    if (currentValue.length <= 1 || (currentValue.length === 2 && currentValue.charAt(0) === '-')) {
      currentValue = '0';
    } else {
      currentValue = currentValue.slice(0, -1);
    }
  }

  function clearAll() {
    currentValue = '0';
    previousValue = '';
    operator = '';
    shouldResetDisplay = false;
    expression = '';
  }

  /* ---- Modal open/close ---- */
  function openCalc() {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCalc() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- Button click handler ---- */
  function handleButton(btn) {
    var action = btn.getAttribute('data-action');
    var digit = btn.getAttribute('data-digit');
    var op = btn.getAttribute('data-op');

    if (digit !== null) {
      inputDigit(digit);
    } else if (action === 'decimal') {
      inputDecimal();
    } else if (op) {
      inputOperator(op);
    } else if (action === 'equals') {
      inputEquals();
    } else if (action === 'percent') {
      inputPercent();
    } else if (action === 'negate') {
      inputNegate();
    } else if (action === 'backspace') {
      inputBackspace();
    } else if (action === 'clear') {
      clearAll();
    }

    updateDisplay();
  }

  /* ---- Keyboard handler ---- */
  function handleKeyboard(e) {
    if (!modal || !modal.classList.contains('open')) return;

    var key = e.key;

    if (key >= '0' && key <= '9') {
      e.preventDefault();
      inputDigit(key);
    } else if (key === '.') {
      e.preventDefault();
      inputDecimal();
    } else if (key === '+') {
      e.preventDefault();
      inputOperator('+');
    } else if (key === '-') {
      e.preventDefault();
      inputOperator('-');
    } else if (key === '*') {
      e.preventDefault();
      inputOperator('×');
    } else if (key === '/') {
      e.preventDefault();
      inputOperator('÷');
    } else if (key === '%') {
      e.preventDefault();
      inputPercent();
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      inputEquals();
    } else if (key === 'Backspace') {
      e.preventDefault();
      inputBackspace();
    } else if (key === 'Escape') {
      e.preventDefault();
      closeCalc();
      return;
    } else if (key === 'Delete' || key === 'c' || key === 'C') {
      e.preventDefault();
      clearAll();
    } else {
      return;
    }

    updateDisplay();
  }

  /* ---- Init ---- */
  document.addEventListener('DOMContentLoaded', function () {
    modal = document.getElementById('calcModal');
    if (!modal) return;

    displayValue = document.getElementById('calcValue');
    displayExpr = document.getElementById('calcExpr');
    closeBtn = document.getElementById('calcClose');

    // Open button(s) — nav tab
    var openBtns = document.querySelectorAll('[data-calc-open]');
    for (var i = 0; i < openBtns.length; i++) {
      openBtns[i].addEventListener('click', function (e) {
        e.preventDefault();
        openCalc();
      });
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCalc);
    }

    // Overlay click to close
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeCalc();
    });

    // Calculator buttons
    var btns = modal.querySelectorAll('.calc-btn');
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener('click', function () {
        handleButton(this);
      });
    }

    // Keyboard support
    document.addEventListener('keydown', handleKeyboard);
  });
})();
