// This video's own hook.
//
// The idea: a $2 cookie and a $16 plate sit on the two ends of a seesaw. It tips back and
// forth, can't decide, then freezes dead level with a record scratch and a big question mark.
// Frame one shows: the seesaw already mid-tip, the plate end down.
// Readable by 0.5 s: "QUIZ" and "Which earns you *more*?", with the two price tags.
// The open loop: which one really earns more? (The answer comes at the end.)
//
// props: { label, line, left, right, mark }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const P = { x: 500, y: 1160 }, HALF = 300, FREEZE = 1.9;

// The seesaw's angle: swinging, slowing, then frozen level at FREEZE.
function tilt(sec) {
  if (sec >= FREEZE) return 0;
  const k = 1 - S.seg(sec, 0, FREEZE);
  return 0.2 * Math.cos(sec * 4.4) * (0.35 + 0.65 * k);
}

function cookie(ctx, x, y) {
  pen.shape(ctx, pen.ellipse(x, y - 62, 72, 62, 30), { fill: C.butter, width: 6, seed: 17101, offset: 0 });
  [[-28, -86], [22, -96], [-6, -54], [34, -48], [-38, -40]].forEach(([dx, dy], i) =>
    pen.shape(ctx, pen.ellipse(x + dx, y + dy, 9, 8, 10), { fill: C.ink, width: 3, seed: 17110 + i, offset: 0 }));
}

function plate(ctx, x, y) {
  // The food first, then the plate's front rim over it.
  pen.shape(ctx, pen.ellipse(x - 20, y - 50, 70, 46, 24), { fill: C.tomato, width: 6, seed: 17120, offset: 0 });
  pen.shape(ctx, pen.ellipse(x + 50, y - 40, 44, 30, 20), { fill: C.forest, width: 5, seed: 17121, offset: 0 });
  pen.shape(ctx, pen.ellipse(x, y - 14, 130, 30, 32), { fill: C.card, width: 6, seed: 17122, offset: 0 });
  pen.line(ctx, [{ x: x - 40, y: y - 120 }, { x: x - 30, y: y - 145 }, { x: x - 40, y: y - 170 }], { width: 4, color: C.muted, seed: 17123 });
}

function tag(ctx, theme, str, x, y, seed) {
  pen.shape(ctx, pen.roundRect(x - 135, y - 52, 270, 86, 16), { fill: C.card, width: 5, seed, offset: 3 });
  text(ctx, str, x, y + 16, { size: 58, align: 'center', color: theme.accent });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 270, { seed: 17001 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 340, size: 124, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 17002 });

  // The fulcrum.
  pen.shape(ctx, [{ x: P.x, y: P.y }, { x: P.x + 90, y: P.y + 170 }, { x: P.x - 90, y: P.y + 170 }], { fill: C.rose, width: 7, seed: 17010, offset: 0 });
  pen.line(ctx, [{ x: 100, y: P.y + 172 }, { x: 900, y: P.y + 168 }], { width: 6, seed: 17011 });

  // The plank, and the two ends (the items stay upright as it tips).
  const a = tilt(sec), ca = Math.cos(a), sa = Math.sin(a);
  const L = { x: P.x - HALF * ca, y: P.y - HALF * sa }, R = { x: P.x + HALF * ca, y: P.y + HALF * sa };
  ctx.save(); ctx.translate(P.x, P.y); ctx.rotate(a);
  pen.shape(ctx, pen.roundRect(-HALF - 30, -26, 2 * HALF + 60, 30, 10), { fill: C.card, width: 6, seed: 17012, offset: 0 });
  ctx.restore();
  cookie(ctx, L.x, L.y - 26);
  plate(ctx, R.x, R.y - 26);
  tag(ctx, theme, props.left || '', L.x, L.y - 230, 17030);
  tag(ctx, theme, props.right || '', R.x, R.y - 250, 17031);

  // Motion lines while it swings.
  if (sec < FREEZE) {
    const dir = Math.sign(-Math.sin(sec * 4.4)) || 1;
    pen.line(ctx, [{ x: L.x - 110, y: L.y - 20 + dir * 30 }, { x: L.x - 110, y: L.y - 20 - dir * 30 }], { width: 5, color: C.muted, seed: 17040 });
    pen.line(ctx, [{ x: R.x + 145, y: R.y - 20 - dir * 30 }, { x: R.x + 145, y: R.y - 20 + dir * 30 }], { width: 5, color: C.muted, seed: 17041 });
  }

  // Frozen: a flash, then the question mark pops over the fulcrum.
  if (sec >= FREEZE) S.flash(ctx, 1 - S.seg(sec, FREEZE, FREEZE + 0.25));
  const q = S.pop(sec, FREEZE + 0.05, 0.35);
  S.popIn(ctx, q, P.x, 900, () => {
    pen.shape(ctx, pen.ellipse(P.x, 860, 82, 82, 32), { fill: C.lime, width: 6, seed: 17050, offset: 0 });
    text(ctx, props.mark || '?', P.x, 900, { size: 130, align: 'center' });
  });

  // Roma Tom below, watching it swing, then thinking.
  tomato(ctx, 'Roma Tom', W / 2, 1600, 300, { squash: S.breathe(sec), angle: -a * 0.6 });
  S.reaction(ctx, theme, 'think', W / 2, 1520, S.seg(sec, FREEZE + 0.2, FREEZE + 0.8));
}

hook.cues = () => [
  { sec: 0, sfx: 'boing', gain: 0.4 }, { sec: 0.72, sfx: 'tap', gain: 0.35 }, { sec: 1.43, sfx: 'tap', gain: 0.3 },
  { sec: FREEZE, sfx: 'scratch', gain: 0.55 }, { sec: FREEZE + 0.05, sfx: 'pop', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
