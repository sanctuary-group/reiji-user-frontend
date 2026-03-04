/**
 * Auth Guard - Include on all pages using user-app layout
 * Allows unauthenticated users to view the page but exposes
 * REIJI_IS_LOGGED_IN and REIJI_REQUIRE_LOGIN for gating interactions.
 */
(function () {
  var API_BASE = '/api';
  var token = localStorage.getItem('reiji_token');
  var DELETE_COOKIE = 'reiji_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  window.REIJI_IS_LOGGED_IN = false;

  // Show login prompt modal
  window.REIJI_REQUIRE_LOGIN = function () {
    var modal = document.getElementById('loginPromptModal');
    if (modal) modal.classList.add('open');
  };

  function showPage() {
    document.body.style.visibility = 'visible';
  }

  function clearAuth() {
    localStorage.removeItem('reiji_token');
    localStorage.removeItem('reiji_user');
    document.cookie = DELETE_COOKIE;
  }

  if (!token) {
    showPage();
    return;
  }

  // Validate token with API
  fetch(API_BASE + '/user', {
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/json',
    },
  })
  .then(function (res) {
    if (!res.ok) {
      clearAuth();
      showPage();
      return null;
    }
    return res.json();
  })
  .then(function (data) {
    if (data && data.id) {
      window.REIJI_USER = data;
      window.REIJI_TOKEN = token;
      window.REIJI_IS_LOGGED_IN = true;
    }
    showPage();
  })
  .catch(function () {
    clearAuth();
    showPage();
  });

  // Logout handler
  window.REIJI_LOGOUT = function () {
    var logoutToken = localStorage.getItem('reiji_token');
    clearAuth();

    if (logoutToken) {
      fetch(API_BASE + '/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + logoutToken,
          'Accept': 'application/json',
        },
      }).catch(function () {});
    }

    window.location.replace('/login');
  };
})();
