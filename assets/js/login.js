/**
 * Login Wizard JS - Step-based login flow
 */
(function () {
  var currentStep = 1;
  var totalSteps = 5;

  document.addEventListener('DOMContentLoaded', function () {
    // Step 1: Email form submit
    var emailForm = document.getElementById('emailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        goToStep(2);
      });
    }

    // Step 2: LINE login button
    var lineLoginBtn = document.getElementById('lineLoginBtn');
    if (lineLoginBtn) {
      lineLoginBtn.addEventListener('click', function () {
        goToStep(3);
      });
    }

    // Step 3: Add friend button
    var addFriendBtn = document.getElementById('addFriendBtn');
    if (addFriendBtn) {
      addFriendBtn.addEventListener('click', function () {
        goToStep(4);
      });
    }

    // Step 3: Skip button
    var skipFriendBtn = document.getElementById('skipFriendBtn');
    if (skipFriendBtn) {
      skipFriendBtn.addEventListener('click', function () {
        goToStep(4);
      });
    }

    // Step 4: Next button
    var goStep5Btn = document.getElementById('goStep5Btn');
    if (goStep5Btn) {
      goStep5Btn.addEventListener('click', function () {
        goToStep(5);
      });
    }
  });

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Update progress bar
    var progressSteps = document.querySelectorAll('.login-progress-step');
    var progressLines = document.querySelectorAll('.login-progress-line');

    for (var i = 0; i < progressSteps.length; i++) {
      var stepNum = parseInt(progressSteps[i].getAttribute('data-step'), 10);
      progressSteps[i].classList.remove('active', 'completed');

      if (stepNum < step) {
        progressSteps[i].classList.add('completed');
        // Replace number with check icon
        var numEl = progressSteps[i].querySelector('.login-progress-num');
        if (numEl) numEl.innerHTML = '<i class="fa-solid fa-check" style="font-size: 12px;"></i>';
      } else if (stepNum === step) {
        progressSteps[i].classList.add('active');
      }
    }

    // Update progress lines
    for (var j = 0; j < progressLines.length; j++) {
      progressLines[j].classList.remove('completed');
      if (j < step - 1) {
        progressLines[j].classList.add('completed');
      }
    }

    // Switch step content
    var steps = document.querySelectorAll('.login-step');
    for (var k = 0; k < steps.length; k++) {
      steps[k].classList.remove('active');
    }
    var target = document.querySelector('.login-step[data-step="' + step + '"]');
    if (target) target.classList.add('active');

    currentStep = step;
  }
})();
