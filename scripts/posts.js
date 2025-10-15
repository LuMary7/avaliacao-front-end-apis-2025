let allPosts = [];

async function fetchPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  const posts = await res.json();
  allPosts = posts;
  renderPosts(posts);
}

function renderPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = posts.map(post => `
    <div class="post-card" data-id="${post.id}">
      <h3>${post.title}</h3>
    </div>
  `).join('');
}

document.getElementById('posts-container').addEventListener('click', async (e) => {
  const card = e.target.closest('.post-card');
  if (!card) return;

  const id = card.dataset.id;
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const post = await res.json();

  document.getElementById('modal-title').textContent = post.title;
  document.getElementById('modal-body').textContent = post.body;
  document.getElementById('modal').style.display = 'flex';
});

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').style.display = 'none';
};

document.getElementById('search').addEventListener('input', function () {
  const value = this.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.title.toLowerCase().includes(value)
  );
  renderPosts(filtered);
});

async function refreshTokenIfNeeded() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return;

  const res = await fetch('https://dummyjson.com/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem('accessToken', data.token);
  }
}

if (!localStorage.getItem('accessToken')) {
  window.location.href = './login.html';
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = './login.html';
});

refreshTokenIfNeeded().then(() => {
  fetchPosts();
});