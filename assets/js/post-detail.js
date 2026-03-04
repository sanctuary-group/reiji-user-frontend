/**
 * Post Detail Page
 * Uses API: GET /api/posts/:id
 */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var postId = getPostIdFromUrl();
    if (postId) {
      loadPost(postId);
    } else {
      window.location.href = '/posts';
    }
  });

  function getPostIdFromUrl() {
    var match = window.location.pathname.match(/\/posts\/(\d+)/);
    return match ? match[1] : null;
  }

  function loadPost(id) {
    fetch('/api/posts/' + id, {
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Not found');
      return res.json();
    })
    .then(function (post) {
      renderPostDetail(post);
      document.title = post.title + ' | REIJI';
    })
    .catch(function () {
      renderNotFound();
    });
  }

  function renderPostDetail(post) {
    var container = document.getElementById('postDetail');
    if (!container) return;

    var imgFit = post.imageFit || 'cover';
    var bgSize = imgFit === 'auto' ? 'auto' : imgFit;
    var bgStyle = post.imageUrl
      ? 'background-image:url(' + escapeHtml(post.imageUrl) + ');background-size:' + bgSize + ';background-position:center;background-repeat:no-repeat;background-color:#1a1a2e'
      : 'background:' + (post.bgColor || '#1a1a2e');

    var date = '';
    if (post.publishedAt) {
      var d = new Date(post.publishedAt);
      date = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日';
    }

    var html = '';

    // Hero banner
    html += '<div class="post-hero" style="' + bgStyle + '">' +
      '<div class="post-hero-overlay">' +
        '<h1 class="post-hero-title">' + escapeHtml(post.title) + '</h1>' +
        (post.subtitle ? '<p class="post-hero-subtitle">' + escapeHtml(post.subtitle) + '</p>' : '') +
      '</div>' +
    '</div>';

    // Meta
    html += '<div class="post-meta">' +
      '<span><i class="fa-solid fa-user"></i> ' + escapeHtml(post.author) + '</span>' +
      '<span><i class="fa-solid fa-clock"></i> ' + date + '</span>' +
    '</div>';

    // Body
    if (post.body) {
      html += '<div class="post-body">' + renderMarkdown(post.body) + '</div>';
    }

    // Links
    if (post.links && post.links.length > 0) {
      html += '<div class="post-links">' +
        '<h3 class="post-links-title"><i class="fa-solid fa-link"></i> 関連リンク</h3>';
      post.links.forEach(function (link) {
        html += '<a href="' + escapeHtml(link.url) + '" class="post-link-item" target="_blank" rel="noopener noreferrer">' +
          '<i class="fa-solid fa-external-link-alt"></i>' +
          '<span>' + escapeHtml(link.title) + '</span>' +
        '</a>';
      });
      html += '</div>';
    }

    // Back link
    html += '<div class="post-back">' +
      '<a href="/posts" class="btn btn-ghost"><i class="fa-solid fa-arrow-left"></i> 投稿一覧に戻る</a>' +
    '</div>';

    container.innerHTML = html;
  }

  function renderNotFound() {
    var container = document.getElementById('postDetail');
    if (!container) return;

    container.innerHTML = '<div class="post-not-found">' +
      '<i class="fa-solid fa-exclamation-circle"></i>' +
      '<h2>投稿が見つかりません</h2>' +
      '<p>この投稿は削除されたか、まだ公開されていません。</p>' +
      '<a href="/posts" class="btn btn-primary">投稿一覧に戻る</a>' +
    '</div>';
  }

  function renderMarkdown(text) {
    if (!text) return '';
    // Simple markdown-like rendering
    var html = escapeHtml(text);
    // Headings
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Blockquote
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Newlines
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }
})();
