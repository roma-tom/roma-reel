// This video's own hook.
//
// The idea: a panel of three tomato judges sits behind the counter like a talent show and
// slaps up score paddles one after another, 6, then 8, then Roma Tom slams a 10 in rose and
// the whole panel gasps: these aren't dance routines being scored, they're cafe crimes.
// Frame one shows: Maria's paddle already swinging up from under the counter.
// Readable by 0.5 s: "Rate these *cafe crimes*." (1 TO 10 pill above it).
// The open loop: which crimes are these, and what earns a ten?
//
// props: { label, line, scores: ['6', '8', '10'] (left, right, middle; the last is the ten) }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const TOP = 1400;                         // the judges' counter
const SEATS = [210, 840, 525];            // Maria, Dev, Roma Tom (the ten comes last, in the middle)
const NAMES = ['Maria', 'Dev', 'Roma Tom'];
const UP = [-0.12, 0.4, 0.85];               // when each paddle starts up, in seconds
const SLAM = UP[2] + 0.28;                // the ten lands

// A score paddle: a round card on a stick, raised by k (0 hidden below the counter, 1 up).
function paddle(ctx, theme, x, k, score, seed, hot) {
  if (k <= 0) return;
  const r = hot ? 118 : 96;
  const y = 1200 - (1200 - 760) * k;
  const tilt = (1 - Math.min(1, k)) * 0.5 * (x < W / 2 ? -1 : 1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.translate(-x, -y);
  pen.line(ctx, [{ x, y: y + r - 6 }, { x: x + 4, y: y + r + 200 }], { width: 16, color: C.ink, seed: seed + 1 });
  pen.shape(ctx, pen.ellipse(x, y, r, r, 36), { fill: hot ? C.rose : C.card, width: 7, seed, offset: 0 });
  text(ctx, score, x, y + (hot ? 48 : 40), { size: hot ? 150 : 124, align: 'center', color: hot ? C.card : C.ink });
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.2;
  const scores = (props.scores || []).slice(0, 3);

  kicker(ctx, props.label || '', W / 2 - 60, 260, { seed: 17101 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 330, size: 128, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 17102 });

  // The paddles come up one by one with a little overshoot; the ten slams with a flash.
  scores.forEach((s, i) => {
    const k = S.pop(sec, UP[i], i === 2 ? 0.28 : 0.35);
    paddle(ctx, theme, SEATS[i], k, s, 17120 + i * 4, i === 2);
  });
  // The judges, bobbing; everyone jumps when the ten lands.
  SEATS.forEach((x, i) => {
    const j = S.jump(sec, SLAM + i * 0.05, i === 2 ? 50 : 30);
    const size = i === 2 ? 460 : 380;
    tomato(ctx, NAMES[i], x, TOP - size * 0.5 - j.hop, size, { squash: j.squash, angle: Math.sin(sec * 2 + i) * 0.03 });
  });
  S.reaction(ctx, theme, 'shock', SEATS[0], TOP - 190, S.seg(sec, SLAM, SLAM + 0.5));
  S.reaction(ctx, theme, 'shock', SEATS[1], TOP - 190, S.seg(sec, SLAM + 0.08, SLAM + 0.58));

  S.counter(ctx, TOP);

  if (sec >= SLAM) S.flash(ctx, 1 - S.seg(sec, SLAM, SLAM + 0.35));
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.5 },
  { sec: UP[1], sfx: 'swish', gain: 0.5 },
  { sec: SLAM, sfx: 'boing', gain: 0.7 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
