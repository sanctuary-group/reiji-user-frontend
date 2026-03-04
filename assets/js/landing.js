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

    container.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-tertiary);grid-column:1/-1;">人気ユーザー機能は準備中です</div>';
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
