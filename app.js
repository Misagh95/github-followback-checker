const form = document.querySelector('#check-form');
const usernameInput = document.querySelector('#username');
const tokenInput = document.querySelector('#token');
const tokenToggle = document.querySelector('#token-toggle');
const tokenArea = document.querySelector('#token-area');
const checkButton = document.querySelector('#check-button');
const emptyState = document.querySelector('#empty-state');
const loadingState = document.querySelector('#loading-state');
const loadingDetail = document.querySelector('#loading-detail');
const errorState = document.querySelector('#error-state');
const errorMessage = document.querySelector('#error-message');
const retryButton = document.querySelector('#retry-button');
const dataState = document.querySelector('#data-state');
const resultUsername = document.querySelector('#result-username');
const followingCount = document.querySelector('#following-count');
const followersCount = document.querySelector('#followers-count');
const notFollowingCount = document.querySelector('#not-following-count');
const mutualCount = document.querySelector('#mutual-count');
const followbackRate = document.querySelector('#followback-rate');
const rateProgress = document.querySelector('#rate-progress');
const listSummary = document.querySelector('#list-summary');
const userList = document.querySelector('#user-list');
const noResults = document.querySelector('#no-results');
const listFilter = document.querySelector('#list-filter');
const sortList = document.querySelector('#sort-list');
const exportCsv = document.querySelector('#export-csv');
const exportJson = document.querySelector('#export-json');

const state = {
  username: '',
  following: [],
  followers: [],
  notFollowingBack: [],
};

let lastRequest = '';

form.addEventListener('submit', (event) => {
  event.preventDefault();
  checkUser(usernameInput.value);
});

retryButton.addEventListener('click', () => checkUser(lastRequest || usernameInput.value));
tokenToggle.addEventListener('click', () => {
  const willShow = tokenArea.hidden;
  tokenArea.hidden = !willShow;
  tokenToggle.setAttribute('aria-expanded', String(willShow));
  if (willShow) tokenInput.focus();
});
listFilter.addEventListener('input', renderUserList);
sortList.addEventListener('change', renderUserList);
exportCsv.addEventListener('click', downloadCsv);
exportJson.addEventListener('click', downloadJson);

const urlUsername = new URLSearchParams(window.location.search).get('username');
if (urlUsername) {
  usernameInput.value = urlUsername.replace(/^@/, '');
  checkUser(urlUsername);
}

async function checkUser(rawUsername) {
  const username = rawUsername.trim().replace(/^@/, '').replace(/\\/g, '');
  if (!username) return;

  lastRequest = username;
  usernameInput.value = username;
  setView('loading');
  checkButton.disabled = true;
  checkButton.querySelector('.button-label').textContent = 'در حال بررسی...';

  try {
    const [following, followers] = await Promise.all([
      fetchAllPages(username, 'following'),
      fetchAllPages(username, 'followers'),
    ]);

    state.username = username;
    state.following = following;
    state.followers = followers;
    const followerIds = new Set(followers.map((user) => user.id));
    state.notFollowingBack = following.filter((user) => !followerIds.has(user.id));

    renderStats();
    renderUserList();
    setView('data');
  } catch (error) {
    errorMessage.textContent = error.message || 'خطایی ناشناخته رخ داد.';
    setView('error');
  } finally {
    checkButton.disabled = false;
    checkButton.querySelector('.button-label').textContent = 'بررسی کن';
  }
}

async function fetchAllPages(username, relation) {
  const results = [];
  let page = 1;
  const headers = { Accept: 'application/vnd.github+json' };
  const token = tokenInput.value.trim();
  if (token) headers.Authorization = `Bearer ${token}`;

  while (true) {
    loadingDetail.textContent = `${relation === 'following' ? 'دنبال‌شده‌ها' : 'دنبال‌کننده‌ها'} — صفحه ${page}`;
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/${relation}?per_page=100&page=${page}`, { headers });

    if (response.status === 404) throw new Error('این نام کاربری گیت‌هاب پیدا نشد.');
    if (response.status === 403) throw new Error('محدودیت درخواست GitHub API پر شده است؛ چند دقیقه بعد دوباره امتحان کنید یا توکن وارد کنید.');
    if (!response.ok) throw new Error(`گیت‌هاب با خطای ${response.status} پاسخ داد.`);

    const pageData = await response.json();
    results.push(...pageData);
    if (pageData.length < 100) return results;
    page += 1;
  }
}

function renderStats() {
  const followingTotal = state.following.length;
  const followersTotal = state.followers.length;
  const notFollowingTotal = state.notFollowingBack.length;
  const mutualTotal = followingTotal - notFollowingTotal;
  const rate = followingTotal ? Math.round((mutualTotal / followingTotal) * 100) : 0;

  resultUsername.textContent = state.username;
  followingCount.textContent = followingTotal;
  followersCount.textContent = followersTotal;
  notFollowingCount.textContent = notFollowingTotal;
  mutualCount.textContent = mutualTotal;
  followbackRate.textContent = rate;
  rateProgress.style.width = `${rate}%`;
  listSummary.textContent = `${notFollowingTotal} حساب از ${followingTotal} حساب فالو‌بک نکرده‌اند.`;
}

function renderUserList() {
  const query = listFilter.value.trim().toLowerCase();
  const sorted = [...state.notFollowingBack].sort((a, b) => {
    if (sortList.value === 'id') return a.id - b.id;
    return a.login.localeCompare(b.login);
  });
  const filtered = sorted.filter((user) => user.login.toLowerCase().includes(query));

  userList.innerHTML = filtered.map((user) => `
    <article class="user-item">
      <img class="user-avatar" src="${escapeAttribute(user.avatar_url)}" alt="" loading="lazy" />
      <div class="user-info">
        <div class="user-login">${escapeHtml(user.login)}</div>
        <div class="user-name">هنوز شما را دنبال نکرده</div>
      </div>
      <a class="user-link" href="${escapeAttribute(user.html_url)}" target="_blank" rel="noreferrer" aria-label="مشاهده پروفایل ${escapeAttribute(user.login)}">↗</a>
    </article>
  `).join('');
  noResults.hidden = filtered.length !== 0;
}

function downloadCsv() {
  const header = 'username,profile_url';
  const rows = state.notFollowingBack.map((user) => `${csvCell(user.login)},${csvCell(user.html_url)}`);
  download(`${header}\n${rows.join('\n')}`, `${state.username}-not-following-back.csv`, 'text/csv;charset=utf-8');
}

function downloadJson() {
  const payload = {
    username: state.username,
    checkedAt: new Date().toISOString(),
    following: state.following.length,
    followers: state.followers.length,
    notFollowingBack: state.notFollowingBack.map(({ login, html_url: profile }) => ({ login, profile })),
  };
  download(JSON.stringify(payload, null, 2), `${state.username}-followback-report.json`, 'application/json');
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function setView(view) {
  emptyState.hidden = view !== 'empty';
  loadingState.hidden = view !== 'loading';
  errorState.hidden = view !== 'error';
  dataState.hidden = view !== 'data';
}
