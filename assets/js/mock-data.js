/**
 * API Helpers & Utilities
 */

/**
 * Authenticated API fetch helper
 */
function apiFetch(url, options) {
  options = options || {};
  options.headers = options.headers || {};
  options.headers['Authorization'] = 'Bearer ' + (window.REIJI_TOKEN || localStorage.getItem('reiji_token') || '');
  options.headers['Accept'] = 'application/json';
  if (options.body && typeof options.body !== 'string' && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  return fetch(url, options);
}

/**
 * Format number as Japanese yen
 */
function formatYen(amount) {
  var prefix = amount >= 0 ? '+' : '';
  return prefix + new Intl.NumberFormat('ja-JP').format(amount) + '円';
}
