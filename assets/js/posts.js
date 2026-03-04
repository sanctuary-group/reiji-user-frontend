/**
 * Posts Listing Page
 * Uses API: GET /api/posts
 */
(function () {
  var currentPage = 1;
  var totalPages = 1;

  document.addEventListener('DOMContentLoaded', function () {
    loadPosts();
  });

  function loadPosts() {
    var params = new URLSearchParams();
    params.set('page', currentPage);

    fetch('/api/posts?' + params.toString(), {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function (json) {
      totalPages = json.lastPage || 1;
      currentPage = json.currentPage || 1;
      renderPostGrid(json.data || []);
      renderPagination(json);
    })
    .catch(function () {
      showEmpty();
    });
  }

  function renderPostGrid(posts) {
    var grid = document.getElementById('postsGrid');
    var empty = document.getElementById('postsEmpty');
    if (!grid) return;

    if (posts.length === 0) {
      grid.innerHTML = '';
      showEmpty();
      return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = posts.map(function (post) {
      var imgFit = post.imageFit || 'cover';
      var bgSize = imgFit === 'auto' ? 'auto' : imgFit;
      var bgStyle = post.imageUrl
        ? 'background-image:url(' + escapeHtml(post.imageUrl) + ');background-size:' + bgSize + ';background-position:center;background-repeat:no-repeat;background-color:#1a1a2e'
        : 'background:' + (post.bgColor || '#1a1a2e');

      var date = '';
      if (post.publishedAt) {
        var d = new Date(post.publishedAt);
        date = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
      }

      return '<a href="/posts/' + post.id + '" class="post-card">' +
        '<div class="post-card-image" style="' + bgStyle + '">' +
        '</div>' +
        '<div class="post-card-body">' +
          '<h3 class="post-card-title">' + escapeHtml(post.title) + '</h3>' +
          (post.subtitle ? '<p class="post-card-subtitle">' + escapeHtml(post.subtitle) + '</p>' : '') +
          '<div class="post-card-meta">' +
            '<span><i class="fa-solid fa-user"></i> ' + escapeHtml(post.author) + '</span>' +
            '<span><i class="fa-solid fa-clock"></i> ' + date + '</span>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  function renderPagination(json) {
    var container = document.getElementById('postsPagination');
    if (!container || totalPages <= 1) {
      if (container) container.innerHTML = '';
      return;
    }

    var html = '';

    html += '<button class="posts-page-btn" onclick="PostsListPage.goToPage(' + (currentPage - 1) + ')"' +
      (currentPage <= 1 ? ' disabled' : '') + '>' +
      '<i class="fa-solid fa-chevron-left"></i></button>';

    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="posts-page-btn' + (i === currentPage ? ' active' : '') + '" ' +
        'onclick="PostsListPage.goToPage(' + i + ')">' + i + '</button>';
    }

    html += '<button class="posts-page-btn" onclick="PostsListPage.goToPage(' + (currentPage + 1) + ')"' +
      (currentPage >= totalPages ? ' disabled' : '') + '>' +
      '<i class="fa-solid fa-chevron-right"></i></button>';

    container.innerHTML = html;
  }

  function showEmpty() {
    var empty = document.getElementById('postsEmpty');
    if (empty) empty.style.display = 'flex';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  window.PostsListPage = {
    goToPage: function (page) {
      if (page < 1 || page > totalPages) return;
      currentPage = page;
      loadPosts();
      window.scrollTo(0, 0);
    }
  };
})();
