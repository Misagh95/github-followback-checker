import { appendFileSync } from 'node:fs';

const API_URL = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN?.trim();
const dryRun = !['0', 'false', 'no'].includes((process.env.DRY_RUN || 'true').toLowerCase());
const maxUnfollows = parseLimit(process.env.MAX_UNFOLLOWS, 25);
const excludedUsers = new Set(
  (process.env.EXCLUDE_USERS || '')
    .split(',')
    .map((username) => username.trim().toLowerCase())
    .filter(Boolean),
);

if (!token) {
  fail('GITHUB_TOKEN is required. Add an authenticated token as the AUTO_UNFOLLOW_TOKEN repository secret.');
}

const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
};

try {
  const account = await github('/user');
  const username = process.env.GITHUB_USERNAME?.trim() || account.login;
  const [following, followers] = await Promise.all([
    fetchAll('/user/following'),
    fetchAll('/user/followers'),
  ]);
  const followerLogins = new Set(followers.map(({ login }) => login.toLowerCase()));
  const candidates = following.filter(({ login }) => (
    !followerLogins.has(login.toLowerCase()) && !excludedUsers.has(login.toLowerCase())
  ));
  const targets = maxUnfollows === 0 ? candidates : candidates.slice(0, maxUnfollows);

  console.log(`Account: ${username}`);
  console.log(`Following: ${following.length} | Followers: ${followers.length}`);
  console.log(`Non-followers: ${candidates.length} | Selected: ${targets.length}`);
  if (excludedUsers.size) console.log(`Excluded: ${[...excludedUsers].join(', ')}`);

  if (dryRun) {
    console.log('DRY RUN: no accounts will be unfollowed.');
    for (const user of targets) console.log(`Would unfollow @${user.login}`);
    writeSummary({ username, candidates, targets, dryRun: true });
    process.exit(0);
  }

  let unfollowed = 0;
  for (const user of targets) {
    await github(`/user/following/${encodeURIComponent(user.login)}`, { method: 'DELETE' });
    unfollowed += 1;
    console.log(`Unfollowed @${user.login}`);
  }

  console.log(`Done: ${unfollowed} account(s) unfollowed.`);
  writeSummary({ username, candidates, targets, dryRun: false, unfollowed });
} catch (error) {
  fail(error.message);
}

async function fetchAll(path) {
  const results = [];
  for (let page = 1; ; page += 1) {
    const pageData = await github(`${path}?per_page=100&page=${page}`);
    if (!Array.isArray(pageData)) throw new Error(`GitHub returned an unexpected response for ${path}.`);
    results.push(...pageData);
    if (pageData.length < 100) return results;
  }
}

async function github(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body.message ? `: ${body.message}` : '';
    } catch {
      // Keep the HTTP status when GitHub does not return JSON.
    }
    throw new Error(`GitHub API ${response.status}${detail}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function parseLimit(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) fail('MAX_UNFOLLOWS must be a non-negative integer; use 0 for unlimited.');
  return parsed;
}

function writeSummary({ username, candidates, targets, dryRun: wasDryRun, unfollowed = 0 }) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const mode = wasDryRun ? 'Dry run' : 'Automatic unfollow';
  const lines = [
    `## ${mode}`,
    '',
    `- Account: \`${username}\``,
    `- Non-followers found: **${candidates.length}**`,
    `- Selected: **${targets.length}**`,
    `- Unfollowed: **${unfollowed}**`,
  ];
  if (wasDryRun && targets.length) {
    lines.push('', '### Accounts that would be unfollowed', '', ...targets.map(({ login }) => `- [@${login}](https://github.com/${login})`));
  }
  appendFileSync(summaryPath, `${lines.join('\n')}\n`);
}

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}
