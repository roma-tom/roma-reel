// Post a published video to Instagram as a Reel, straight through Instagram's own API (the
// Instagram API with Instagram Login), with no scheduler in between.
//
//   node scripts/instagram.js videos/<slug>       → post it now, as a Reel that also shows on the feed
//   node scripts/instagram.js --check             → check the token: account, token expiry, posts left today
//   node scripts/instagram.js --refresh           → swap the token for a fresh 60-day one (in .env.local)
//
// The video must be published first (node scripts/publish.js videos/<slug>): Instagram fetches
// the video and cover from their public release links itself. The caption is caption.txt.
//
// Needs, in the environment or .env.local at the top of the repo (never print them):
//   INSTAGRAM_ACCESS_TOKEN   a long-lived Instagram user token with instagram_business_basic and
//                            instagram_business_content_publish, for the Roma Tom account
//   INSTAGRAM_USER_ID        optional: the account's Instagram user id (looked up when missing)
//
// Instagram's API has no scheduling: this posts the moment it runs. Long-lived tokens last 60
// days; run --refresh at least once a month (it only works once the token is a day old).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
if (fs.existsSync(ENV_FILE)) {
  // Fill in only what the environment doesn't already set.
  for (const k of ['INSTAGRAM_ACCESS_TOKEN', 'INSTAGRAM_USER_ID']) {
    if (process.env[k]) continue;
    const m = fs.readFileSync(ENV_FILE, 'utf8').match(new RegExp(`^${k}=(.*)$`, 'm'));
    if (m) process.env[k] = m[1].trim().replace(/^["']|["']$/g, '');
  }
}
const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const GRAPH = 'https://graph.instagram.com/v24.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!TOKEN) {
  console.error('no INSTAGRAM_ACCESS_TOKEN: add a long-lived Instagram token to .env.local (or the environment)');
  process.exit(1);
}

// A Graph API call. Errors name only the path, so the token never ends up in the output.
async function ig(method, url, params = {}) {
  const u = new URL(url.startsWith('http') ? url : `${GRAPH}${url}`);
  const all = { ...params, access_token: TOKEN };
  const opts = { method };
  if (method === 'GET') for (const [k, v] of Object.entries(all)) u.searchParams.set(k, v);
  else opts.body = new URLSearchParams(all);
  const r = await fetch(u, opts);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const e = j.error || {};
    throw new Error(`${method} ${u.pathname}: ${r.status} ${e.message || JSON.stringify(j).slice(0, 200)}${e.error_subcode ? ` (subcode ${e.error_subcode})` : ''}`);
  }
  return j;
}

async function userId() {
  if (process.env.INSTAGRAM_USER_ID) return process.env.INSTAGRAM_USER_ID;
  return (await ig('GET', '/me', { fields: 'user_id' })).user_id;
}

// A GitHub release link redirects to a short-lived signed address. Hand Instagram the final
// address, fetched just now, so its downloader doesn't have to follow the redirect.
async function finalUrl(url) {
  const r = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  if (r.status >= 300 && r.status < 400 && r.headers.get('location')) return r.headers.get('location');
  if (!r.ok) throw new Error(`${url} isn't reachable (${r.status}): publish the video first`);
  return url;
}

// The release links publish.js made for this video.
function releaseLinks(slug) {
  const remote = execSync('git remote get-url origin', { cwd: ROOT }).toString().trim();
  const m = remote.replace(/\.git$/, '').match(/github\.com[:/]([^/]+\/[^/]+)$/);
  if (!m) throw new Error(`origin isn't a GitHub repo: ${remote}`);
  const base = `https://github.com/${m[1]}/releases/download/${encodeURIComponent(`video/${slug}`)}`;
  return { video: `${base}/${slug}.mp4`, cover: `${base}/${slug}-cover.jpg` };
}

async function check() {
  const me = await ig('GET', '/me', { fields: 'user_id,username,account_type' });
  const limit = await ig('GET', `/${me.user_id}/content_publishing_limit`, { fields: 'quota_usage,config' });
  const q = (limit.data || [])[0] || {};
  console.log(`account: @${me.username} (${me.account_type}), user id ${me.user_id}`);
  console.log(`posts published through the API in the last 24 hours: ${q.quota_usage ?? '?'} of ${q.config?.quota_total ?? 100}`);
}

async function refresh() {
  const u = new URL('https://graph.instagram.com/refresh_access_token');
  u.searchParams.set('grant_type', 'ig_refresh_token');
  u.searchParams.set('access_token', TOKEN);
  const r = await fetch(u);
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error(`refresh failed: ${j.error?.message || r.status} (a token can be refreshed once it's a day old)`);
  const days = Math.round(j.expires_in / 86400);
  if (fs.existsSync(ENV_FILE) && /^INSTAGRAM_ACCESS_TOKEN=/m.test(fs.readFileSync(ENV_FILE, 'utf8'))) {
    const s = fs.readFileSync(ENV_FILE, 'utf8').replace(/^INSTAGRAM_ACCESS_TOKEN=.*$/m, `INSTAGRAM_ACCESS_TOKEN=${j.access_token}`);
    fs.writeFileSync(ENV_FILE, s);
    console.log(`token refreshed in .env.local; it now lasts ${days} days`);
  } else {
    console.log(`token refreshed; it now lasts ${days} days. The token is set outside .env.local, so update it there by hand (it may have changed).`);
  }
}

async function post(dir) {
  const slug = path.basename(path.resolve(dir));
  const caption = fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8');
  const links = releaseLinks(slug);
  const id = await userId();

  // 1. A container: Instagram fetches the video and cover from their links.
  const container = await ig('POST', `/${id}/media`, {
    media_type: 'REELS',
    video_url: await finalUrl(links.video),
    cover_url: await finalUrl(links.cover),
    caption,
    share_to_feed: 'true',
  });
  console.log(`uploading to Instagram (container ${container.id})…`);

  // 2. Wait for Instagram to process the video (a minute or two for a short Reel).
  for (let i = 0; ; i++) {
    const c = await ig('GET', `/${container.id}`, { fields: 'status_code,status' });
    if (c.status_code === 'FINISHED') break;
    if (c.status_code === 'ERROR' || c.status_code === 'EXPIRED') throw new Error(`Instagram couldn't process the video: ${c.status_code} ${c.status || ''}`);
    if (i >= 40) throw new Error(`still processing after 10 minutes (container ${container.id}); try publishing it later`);
    await sleep(15000);
  }

  // 3. Publish, then fetch the post's link.
  const media = await ig('POST', `/${id}/media_publish`, { creation_id: container.id });
  const { permalink } = await ig('GET', `/${media.id}`, { fields: 'permalink' });
  console.log(`posted: ${permalink}`);
}

const arg = process.argv[2];
(arg === '--check' ? check() : arg === '--refresh' ? refresh() : arg ? post(arg) : Promise.reject(new Error('usage: node scripts/instagram.js videos/<slug> | --check | --refresh')))
  .catch((err) => { console.error(`instagram: ${err.message}`); process.exit(1); });
