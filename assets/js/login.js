/**
 * Login/Registration Wizard JS - API integrated
 */
(function () {
  var API_BASE = '/api';
  var currentStep = 1;
  var totalSteps = 4;
  var registrationToken = null;
  var isLoginMode = false;

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);

    // Check for LINE complete callback
    var lineComplete = params.get('line_complete');
    if (lineComplete === '1') {
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('reiji_registration_step');
      var savedToken = localStorage.getItem('reiji_token');
      if (savedToken) {
        initEventListeners();
        goToStep(4);
        return;
      }
    }

    // Check for password reset token in URL
    var resetToken = params.get('reset_token');
    var resetEmail = params.get('email');
    if (resetToken && resetEmail) {
      window.history.replaceState({}, document.title, window.location.pathname);
      initEventListeners();
      switchToResetMode(resetToken, resetEmail);
      return;
    }

    // Check for verification token in URL
    var token = params.get('token');
    if (token) {
      verifyEmail(token);
      return;
    }

    // Restore registration_token from sessionStorage (survives reload)
    // Validate with server before proceeding to Step 2
    var savedRegToken = sessionStorage.getItem('reiji_registration_token');
    if (savedRegToken) {
      fetch(API_BASE + '/auth/verify-registration-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ registration_token: savedRegToken }),
      })
      .then(function (res) {
        if (res.ok) {
          registrationToken = savedRegToken;
          initEventListeners();
          goToStep(2);
        } else {
          sessionStorage.removeItem('reiji_registration_token');
          initEventListeners();
        }
      })
      .catch(function () {
        sessionStorage.removeItem('reiji_registration_token');
        initEventListeners();
      });
      return;
    }

    // Restore Step 3 (LINE friend add) on reload
    var savedRegStep = sessionStorage.getItem('reiji_registration_step');
    if (savedRegStep === '3') {
      initEventListeners();
      goToStep(3);
      return;
    }

    // Check if user is already logged in
    var savedToken2 = localStorage.getItem('reiji_token');
    var hasLoginCookie = document.cookie.split(';').some(function (c) {
      return c.trim().indexOf('reiji_logged_in=') === 0;
    });
    if (savedToken2 && hasLoginCookie) {
      window.location.href = '/';
      return;
    }
    // トークンはあるがクッキーがない場合はセッション切れ → localStorageをクリア
    if (savedToken2 && !hasLoginCookie) {
      localStorage.removeItem('reiji_token');
      localStorage.removeItem('reiji_user');
    }

    initEventListeners();
  });

  function initEventListeners() {
    // Step 1: Email form submit (registration)
    var emailForm = document.getElementById('emailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sendVerification();
      });
    }

    // Step 2: Registration form submit
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        register();
      });
    }

    // Login form submit (existing users)
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        login();
      });
    }

    // Toggle between register and login
    var showLoginLink = document.getElementById('showLoginForm');
    if (showLoginLink) {
      showLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchToLoginMode();
      });
    }

    var showRegisterLink = document.getElementById('showRegisterForm');
    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchToRegisterMode();
      });
    }

    // Forgot password link
    var showForgotLink = document.getElementById('showForgotForm');
    if (showForgotLink) {
      showForgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchToForgotMode();
      });
    }

    // Back to login from forgot
    var backToLoginLink = document.getElementById('backToLogin');
    if (backToLoginLink) {
      backToLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchToLoginMode();
      });
    }

    // Forgot password form submit
    var forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();
        sendPasswordReset();
      });
    }

    // Reset password form submit
    var resetForm = document.getElementById('resetForm');
    if (resetForm) {
      resetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        resetPassword();
      });
    }

    // Back to login from reset complete
    var resetBackToLoginLink = document.getElementById('resetBackToLogin');
    if (resetBackToLoginLink) {
      resetBackToLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        switchToLoginMode();
      });
    }

    // Step 3: LINE friend add (mandatory) / Skip for existing friends
    var skipFriendBtn = document.getElementById('skipFriendBtn');
    if (skipFriendBtn) {
      skipFriendBtn.addEventListener('click', function () {
        sessionStorage.removeItem('reiji_registration_step');
        goToStep(4);
      });
    }

    // Load LINE settings for Step 3
    loadLineSettings();
  }

  function switchToLoginMode() {
    isLoginMode = true;
    hideError();
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = 'ログイン';

    var progress = document.getElementById('loginProgress');
    if (progress) progress.style.display = 'none';

    var steps = document.querySelectorAll('.login-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active');
    }

    var loginStep = document.querySelector('.login-step[data-step="login"]');
    if (loginStep) loginStep.classList.add('active');
  }

  function switchToRegisterMode() {
    isLoginMode = false;
    hideError();
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = '新規登録';

    var progress = document.getElementById('loginProgress');
    if (progress) progress.style.display = 'flex';

    var steps = document.querySelectorAll('.login-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active');
    }

    var step1 = document.querySelector('.login-step[data-step="1"]');
    if (step1) step1.classList.add('active');

    // Reset progress bar
    var progressSteps = document.querySelectorAll('.login-progress-step');
    var progressLines = document.querySelectorAll('.login-progress-line');
    for (var j = 0; j < progressSteps.length; j++) {
      progressSteps[j].classList.remove('active', 'completed');
      var numEl = progressSteps[j].querySelector('.login-progress-num');
      if (numEl) numEl.textContent = j + 1;
    }
    if (progressSteps[0]) progressSteps[0].classList.add('active');
    for (var k = 0; k < progressLines.length; k++) {
      progressLines[k].classList.remove('completed');
    }
    currentStep = 1;
  }

  var _resetToken = null;
  var _resetEmail = null;

  function switchToForgotMode() {
    hideError();
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = 'パスワードリセット';

    var progress = document.getElementById('loginProgress');
    if (progress) progress.style.display = 'none';

    var steps = document.querySelectorAll('.login-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active');
    }

    var forgotStep = document.querySelector('.login-step[data-step="forgot"]');
    if (forgotStep) forgotStep.classList.add('active');
  }

  function switchToResetMode(token, email) {
    _resetToken = token;
    _resetEmail = email;
    hideError();
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = 'パスワードリセット';

    var progress = document.getElementById('loginProgress');
    if (progress) progress.style.display = 'none';

    var steps = document.querySelectorAll('.login-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('active');
    }

    var resetStep = document.querySelector('.login-step[data-step="reset"]');
    if (resetStep) resetStep.classList.add('active');
  }

  function sendPasswordReset() {
    var emailInput = document.getElementById('forgotEmail');
    var email = emailInput.value;
    var btn = document.getElementById('sendResetBtn');

    hideError();
    btn.disabled = true;
    btn.textContent = '送信中...';

    fetch(API_BASE + '/auth/password/send-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      btn.disabled = false;
      btn.textContent = 'リセットメールを送信';

      if (result.status >= 200 && result.status < 300) {
        var form = document.getElementById('forgotForm');
        var sentMsg = document.getElementById('resetSentMessage');
        if (form) form.style.display = 'none';
        if (sentMsg) sentMsg.style.display = 'block';
      } else {
        showError(result.data.message || 'エラーが発生しました。');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'リセットメールを送信';
      showError('サーバーに接続できません。');
    });
  }

  function resetPassword() {
    var password = document.getElementById('resetPassword').value;
    var passwordConfirm = document.getElementById('resetPasswordConfirm').value;
    var btn = document.getElementById('resetPasswordBtn');

    hideError();

    if (password !== passwordConfirm) {
      showError('パスワードが一致しません。');
      return;
    }

    if (password.length > 8) {
      showError('パスワードは8文字以内で入力してください。');
      return;
    }

    btn.disabled = true;
    btn.textContent = '変更中...';

    fetch(API_BASE + '/auth/password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        token: _resetToken,
        email: _resetEmail,
        password: password,
        password_confirmation: passwordConfirm,
      }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      btn.disabled = false;
      btn.textContent = 'パスワードを変更';

      if (result.status >= 200 && result.status < 300) {
        var form = document.getElementById('resetForm');
        var completeMsg = document.getElementById('resetCompleteMessage');
        if (form) form.style.display = 'none';
        if (completeMsg) completeMsg.style.display = 'block';
      } else {
        showError(result.data.message || 'エラーが発生しました。');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'パスワードを変更';
      showError('サーバーに接続できません。');
    });
  }

  function sendVerification() {
    var emailInput = document.getElementById('email');
    var email = emailInput.value;
    var btn = document.getElementById('sendVerificationBtn');

    hideError();
    btn.disabled = true;
    btn.textContent = '送信中...';

    fetch(API_BASE + '/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      btn.disabled = false;
      btn.textContent = '認証メールを送信';

      if (result.status >= 200 && result.status < 300) {
        var form = document.getElementById('emailForm');
        var sentMsg = document.getElementById('emailSentMessage');
        if (form) form.style.display = 'none';
        if (sentMsg) sentMsg.style.display = 'block';
      } else {
        var msg = result.data.message || '';
        if (result.data.errors && result.data.errors.email) {
          msg = result.data.errors.email[0];
        }
        showError(msg || 'エラーが発生しました。');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = '認証メールを送信';
      showError('サーバーに接続できません。');
    });
  }

  function verifyEmail(token) {
    window.history.replaceState({}, document.title, window.location.pathname);

    fetch(API_BASE + '/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ token: token }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      if (result.data.registration_token) {
        registrationToken = result.data.registration_token;
        sessionStorage.setItem('reiji_registration_token', registrationToken);
        initEventListeners();
        goToStep(2);
      } else {
        initEventListeners();
        showError(result.data.message || 'トークンが無効です。');
      }
    })
    .catch(function () {
      initEventListeners();
      showError('サーバーに接続できません。');
    });
  }

  function register() {
    var password = document.getElementById('regPassword').value;
    var passwordConfirm = document.getElementById('regPasswordConfirm').value;

    hideError();

    if (password !== passwordConfirm) {
      showError('パスワードが一致しません。');
      return;
    }

    if (password.length > 8) {
      showError('パスワードは8文字以内で入力してください。');
      return;
    }

    var agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
      showError('プライバシーポリシーと利用規約に同意してください。');
      return;
    }

    var btn = document.querySelector('#registerForm button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '登録中...';

    fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        registration_token: registrationToken,
        display_name: document.getElementById('displayName').value,
        line_name: document.getElementById('lineName').value,
        age: parseInt(document.getElementById('age').value, 10),
        gender: document.getElementById('gender').value,
        occupation_type: document.getElementById('occupationType').value,
        password: password,
        password_confirmation: passwordConfirm,
      }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      btn.disabled = false;
      btn.textContent = 'アカウントを作成';

      if (result.data.token) {
        sessionStorage.removeItem('reiji_registration_token');
        sessionStorage.setItem('reiji_registration_step', '3');
        localStorage.setItem('reiji_token', result.data.token);
        localStorage.setItem('reiji_user', JSON.stringify(result.data.user));
        document.cookie = 'reiji_logged_in=1; path=/; SameSite=Lax';
        goToStep(3);
      } else {
        var msg = result.data.message || '登録に失敗しました。';
        if (result.data.errors) {
          var firstKey = Object.keys(result.data.errors)[0];
          if (firstKey) msg = result.data.errors[firstKey][0];
        }
        showError(msg);
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'アカウントを作成';
      showError('サーバーに接続できません。');
    });
  }

  function login() {
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;

    hideError();

    var btn = document.querySelector('#loginForm button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'ログイン中...';

    fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password }),
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { status: res.status, data: data };
      });
    })
    .then(function (result) {
      btn.disabled = false;
      btn.textContent = 'ログイン';

      if (result.data.token) {
        localStorage.setItem('reiji_token', result.data.token);
        localStorage.setItem('reiji_user', JSON.stringify(result.data.user));
        document.cookie = 'reiji_logged_in=1; path=/; SameSite=Lax';
        window.location.href = '/';
      } else {
        showError(result.data.message || 'ログインに失敗しました。');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'ログイン';
      showError('サーバーに接続できません。');
    });
  }

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    hideError();

    // Update progress bar
    var progressSteps = document.querySelectorAll('.login-progress-step');
    var progressLines = document.querySelectorAll('.login-progress-line');

    for (var i = 0; i < progressSteps.length; i++) {
      var stepNum = parseInt(progressSteps[i].getAttribute('data-step'), 10);
      progressSteps[i].classList.remove('active', 'completed');

      if (stepNum < step) {
        progressSteps[i].classList.add('completed');
        var numEl = progressSteps[i].querySelector('.login-progress-num');
        if (numEl) numEl.innerHTML = '<i class="fa-solid fa-check" style="font-size: 12px;"></i>';
      } else if (stepNum === step) {
        progressSteps[i].classList.add('active');
      }
    }

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

  function showError(message) {
    var errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function hideError() {
    var errorEl = document.getElementById('loginError');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  }

  function loadLineSettings() {
    fetch('/api/site-settings/line', { headers: { 'Accept': 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
      .then(function (data) {
        var addFriendBtn = document.getElementById('addFriendBtn');
        if (addFriendBtn && data.line_url) {
          addFriendBtn.href = data.line_url;
        }
        var qrContainer = document.getElementById('lineQrContainer');
        var qrImage = document.getElementById('lineQrImage');
        if (qrContainer && qrImage && data.line_qr_image) {
          qrImage.src = data.line_qr_image;
          qrContainer.style.display = '';
        }
      })
      .catch(function () {});
  }
})();
