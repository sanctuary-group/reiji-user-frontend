/**
 * Landing Page - Popular users & scroll animations
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    renderPopularUsers();
    initScrollAnimations();
  });

  function renderPopularUsers() {
    var container = document.getElementById('popularUsers');
    if (!container) return;

    var html = '';
    for (var i = 0; i < MOCK_POPULAR_USERS.length; i++) {
      var user = MOCK_POPULAR_USERS[i];
      var pnlClass = user.pnlMonth >= 0 ? 'text-profit' : 'text-loss';
      var pnlText = formatYen(user.pnlMonth);

      html += '<div class="card user-card">' +
        '<span class="user-card-rank">' + (i + 1) + '</span>' +
        '<div class="avatar"><img src="assets/img/avatars/default.svg" alt=""></div>' +
        '<div class="user-card-info">' +
          '<div class="user-card-name">' + user.name + '</div>' +
          '<div class="user-card-style">' + user.style + '</div>' +
        '</div>' +
        '<span class="user-card-pnl ' + pnlClass + '">' + pnlText + '</span>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll('.feature-card, .user-card, .cta-banner');
    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(function (el) { observer.observe(el); });
  }
})();
