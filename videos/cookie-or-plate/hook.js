// This video's own hook.
//
// The idea: a $2 cookie and a $16 plate sit on a seesaw that tips back and forth, then freezes
// dead level with a big question mark popping over it.
// Frame one shows: the seesaw already mid-tip, the cookie up, the plate down.
// Readable by 0.5 s: "Cookie or plate: *which earns more*?"
// The open loop: which one? (Guess before the answer.)
//
// props: { label, line, left, right, mark }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const PIVOT = { x: W / 2, y: 1180 }, HALF = 320, FREEZE = 2.6;

function cookie(ctx, x, y) {
  pen.shape(ctx, pen.ellipse(x, y - 60, 70, 66, 28), { fill: C.butter, width: 6, seed: 17110, offset: 0 });
  [[-25, -80], [20, -50], [-10, -35], [30, -90]].forEach(([dx, dy], i) => pen.fill(ctx, pen.ellipse(x + dx, y + dy, 9, 8, 10), C.ink, { seed: 17111 + i }));
}

function plate(ctx, x, y) {
  pen.shape(ctx, pen.ellipse(x, y - 24, 120, 34, 28), { fill: C.card, width: 6, seed: 17120, offset: 0 });
  pen.shape(ctx, pen.ellipse(x - 20, y - 44, 56, 24, 18), { fill: C.tomato, width: 4, seed: 17121, offset: 0 });
  pen.shape(ctx, pen.ellipse(x + 40, y - 46, 34, 18, 14), { fill: C.forest, width: 4, seed: 17122, offset: 0 });
}

function tag(ctx, theme, x, y, word, seed) {
  pen.shape(ctx, pen.roundRect(x - 70, y - 50, 140, 76, 14), { fill: C.card, width: 5, seed, offset: 0 });
  text(ctx, word, x, y + 10, { size: 60, align: 'center', color: theme.accent });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 17101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 320, size: 110, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 17102 });

  // The seesaw tips back and forth, swinging wider, then snaps level.
  const frozen = sec >= FREEZE;
  const a = frozen ? 0.02 * S.settle(S.seg(sec, FREEZE, FREEZE + 0.6)) : Math.sin(sec * 3.2 + 0.9) * 0.22;
  const ex = Math.cos(a) * HALF, ey = Math.sin(a) * HALF;
  pen.shape(ctx, [{ x: PIVOT.x, y: PIVOT.y }, { x: PIVOT.x + 90, y: PIVOT.y + 170 }, { x: PIVOT.x - 90, y: PIVOT.y + 170 }], { fill: C.ink, width: 5, seed: 17103, offset: 0 });
  pen.line(ctx, [{ x: PIVOT.x - ex, y: PIVOT.y - 10 - ey }, { x: PIVOT.x + ex, y: PIVOT.y - 10 + ey }], { width: 18, color: C.ink, seed: 17104 });
  const L = { x: PIVOT.x - ex, y: PIVOT.y - 20 - ey }, R = { x: PIVOT.x + ex, y: PIVOT.y - 20 + ey };
  ctx.save(); ctx.translate(L.x + 40, L.y); ctx.scale(1.3, 1.3); cookie(ctx, 0, 0); ctx.restore();
  ctx.save(); ctx.translate(R.x - 40, R.y); ctx.scale(1.3, 1.3); plate(ctx, 0, 0); ctx.restore();
  tag(ctx, theme, L.x + 40, L.y - 250, props.left || '', 17130);
  tag(ctx, theme, R.x - 40, R.y - 190, props.right || '', 17131);
  pen.line(ctx, [{ x: L.x + 40, y: L.y - 225 }, { x: L.x + 40, y: L.y - 175 }], { width: 4, seed: 17132 });
  pen.line(ctx, [{ x: R.x - 40, y: R.y - 165 }, { x: R.x - 40, y: R.y - 90 }], { width: 4, seed: 17133 });

  // Frozen level: a big question mark pops in over the pivot.
  if (frozen) {
    const k = S.pop(sec, FREEZE, 0.35);
    S.popIn(ctx, k, PIVOT.x, 760, () => text(ctx, props.mark || '', PIVOT.x, 840, { size: 220, align: 'center', color: theme.accent }));
  }

  // Roma Tom below, eyes going back and forth with the seesaw.
  tomato(ctx, 'Roma Tom', W / 2, 1530, 380, { squash: S.breathe(sec), angle: frozen ? 0 : a * 0.8 });
  S.reaction(ctx, theme, 'think', W / 2 - 40, 1480, frozen ? S.seg(sec, FREEZE, FREEZE + 0.5) : 0);
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.3 }, { sec: 1.0, sfx: 'swish', gain: 0.3 }, { sec: 1.95, sfx: 'swish', gain: 0.3 },
  { sec: FREEZE, sfx: 'scratch', gain: 0.5 }, { sec: FREEZE + 0.1, sfx: 'pop', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
