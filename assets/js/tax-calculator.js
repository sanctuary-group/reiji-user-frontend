(function () {
  'use strict';

  var userType = 'employee';

  function setUserType(type) {
    userType = type;
    document.getElementById('taxBtnEmployee').classList.toggle('active', type === 'employee');
    document.getElementById('taxBtnFreelance').classList.toggle('active', type === 'freelance');
  }

  function calcIncomeTax(taxable) {
    if (taxable <= 1950000) return taxable * 0.05;
    if (taxable <= 3300000) return taxable * 0.10 - 97500;
    if (taxable <= 6950000) return taxable * 0.20 - 427500;
    if (taxable <= 9000000) return taxable * 0.23 - 636000;
    if (taxable <= 18000000) return taxable * 0.33 - 1536000;
    return taxable * 0.40 - 2796000;
  }

  function formatManToOku(man) {
    var oku = Math.floor(man / 10000);
    var rest = Math.floor(man % 10000);
    if (oku >= 1) {
      return rest === 0 ? oku + '億円' : oku + '億' + rest + '万円';
    }
    return man.toLocaleString() + '万円';
  }

  function showResult(tax, resTax, hoken, pension, takeHome) {
    document.getElementById('taxResultTax').innerText = Math.floor(tax).toLocaleString();
    document.getElementById('taxResultResidence').innerText = Math.floor(resTax).toLocaleString();
    document.getElementById('taxResultHoken').innerText = Math.floor(hoken).toLocaleString();
    document.getElementById('taxResultPension').innerText = Math.floor(pension).toLocaleString();
    document.getElementById('taxResultTakeHome').innerText = Math.floor(takeHome).toLocaleString();

    var takeHomeMan = Math.floor(takeHome / 10000);
    var topEl = document.getElementById('taxResultTopAmount');
    topEl.innerText = formatManToOku(takeHomeMan);

    document.getElementById('taxResultArea').style.display = 'block';

    topEl.classList.remove('marker-active');
    void topEl.offsetWidth;
    topEl.classList.add('marker-active');
  }

  function calculateTax() {
    var incomeMan = Number(document.getElementById('taxAnnualIncome').value);
    var income = incomeMan * 10000;
    if (income <= 0 || isNaN(income)) return;

    var taxable = income;
    var hoken = 0;
    var pension = 0;

    if (userType === 'employee') {
      if (income <= 200000) {
        showResult(0, 0, 0, 0, income);
        return;
      }
      taxable = income - 200000;
    }

    if (userType === 'freelance') {
      if (income <= 480000) {
        var h = Math.min(income * 0.10, 1000000);
        var takeHome = income - h - 200000;
        showResult(0, 0, h, 200000, takeHome);
        return;
      }
      taxable = income - 480000;
      hoken = Math.min(income * 0.10, 1000000);
      pension = 200000;
    }

    var incomeTax = calcIncomeTax(taxable);
    var residenceTax = taxable * 0.10;
    var takeHomeFinal = income - incomeTax - residenceTax - hoken - pension;
    showResult(incomeTax, residenceTax, hoken, pension, takeHomeFinal);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('taxBtnEmployee').addEventListener('click', function () {
      setUserType('employee');
    });
    document.getElementById('taxBtnFreelance').addEventListener('click', function () {
      setUserType('freelance');
    });
    document.getElementById('taxCalcBtn').addEventListener('click', function () {
      calculateTax();
    });

    // Enter key support
    document.getElementById('taxAnnualIncome').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        calculateTax();
      }
    });
  });
})();
