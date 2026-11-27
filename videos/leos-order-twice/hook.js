// This video's own hook.
//
// The idea: Leo at his table. A plate slides in; he lifts the top of the bun: tomato, not what he
// asked for. It slides back to the kitchen. It slides in again; he lifts the bun: wrong again. His
// face drops further each time, and a "2x" stamp lands on the screen.
// Frame one shows: the first plate already sliding in.
// Readable by 0.5 s: "Wrong order. *Again.*"
// The open loop: does Leo ever come back?
//
// props: { label, line, stamp }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const TABLE = 1260, ROUNDS = [0.0, 1.5], STAMP = 2.9;

function burger(ctx, x, y, lift, seed) {
  pen.shape(ctx, pen.ellipse(x, y + 20, 170, 34, 28), { fill: C.card, width: 6, seed, offset: 0 });
  pen.shape(ctx, pen.roundRect(x - 110, y - 26, 220, 34, 14), { fill: C.forestDark, width: 4, seed: seed + 1, offset: 0 });
  // The wrong filling: a pile of pickles, plain to see when the bun lifts.
  [-60, -10, 40].forEach((dx, i) => pen.shape(ctx, pen.ellipse(x + dx, y - 34, 26, 12, 14), { fill: C.lime, width: 4, seed: seed + 2 + i, offset: 0 }));
  // The top bun, lifting and tipping back to show the filling.
  ctx.save(); ctx.translate(x - 110, y - 46 - lift * 90); ctx.rotate(-lift * 0.45);
  const top = [];
  for (let i = 0; i <= 16; i++) { const t = Math.PI * i / 16; top.push({ x: 110 - 110 * Math.cos(t), y: -70 * Math.sin(t) }); }
  pen.shape(ctx, top, { fill: C.butter, width: 6, seed: seed + 6, offset: 0 });
  [[60, -40], [110, -52], [160, -40]].forEach(([sx, sy], i) => pen.fill(ctx, pen.ellipse(sx, sy, 6, 4, 8), C.card, { seed: seed + 7 + i }));
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 44101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 44102 });

  // Which round of the wrong order we're in, and where its plate is.
  const r = sec >= ROUNDS[1] ? 1 : 0, s0 = ROUNDS[r];
  const inP = S.at(sec, s0, s0 + 0.35), lift = S.at(sec, s0 + 0.45, s0 + 0.7) * (1 - S.at(sec, s0 + 1.05, s0 + 1.15));
  const outP = r === 0 ? S.at(sec, s0 + 1.15, s0 + 1.45) : 0;
  const px = 1260 - inP * 580 + outP * 760;

  // Leo, more fed up with each round.
  const fed = sec < ROUNDS[1] ? S.at(sec, 0.6, 0.9) * 0.5 : 0.5 + S.at(sec, ROUNDS[1] + 0.6, ROUNDS[1] + 0.9) * 0.5;
  tomato(ctx, 'Leo', 230, 1110, 460, { angle: -0.05 - fed * 0.15, squash: S.breathe(sec), mouth: fed > 0.4 ? 0.6 : undefined });
  if (fed > 0.4) S.reaction(ctx, theme, 'sweat', 270, 1070, S.seg(sec, 0.7, 1.2));
  // The table, and the plate on it.
  pen.shape(ctx, [{ x: -40, y: TABLE }, { x: 1120, y: TABLE - 6 }, { x: 1120, y: TABLE + 50 }, { x: -40, y: TABLE + 56 }], { fill: C.card, width: 6, seed: 44110, offset: 0 });
  pen.line(ctx, [{ x: 200, y: TABLE + 56 }, { x: 210, y: 1540 }], { width: 8, seed: 44111 });
  pen.line(ctx, [{ x: 880, y: TABLE + 50 }, { x: 870, y: 1540 }], { width: 8, seed: 44112 });
  if (px < W + 260) { ctx.save(); ctx.translate(px, TABLE - 30); ctx.scale(1.4, 1.4); burger(ctx, 0, 0, lift, 44120 + r * 10); ctx.restore(); }

  // The "2x" stamp slamming down after the second wrong plate.
  const k = S.pop(sec, STAMP, 0.25);
  if (k > 0) S.popIn(ctx, k, 820, 820, () => {
    ctx.save(); ctx.translate(820, 820); ctx.rotate(-0.15);
    pen.line(ctx, pen.roundRect(-130, -80, 260, 160, 20), { width: 10, color: theme.accent, seed: 44130, closed: true });
    text(ctx, props.stamp || '', 0, 45, { size: 130, align: 'center', color: theme.accent });
    ctx.restore();
  });
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.4 }, { sec: 0.5, sfx: 'squish', gain: 0.4 }, { sec: 1.15, sfx: 'whoosh', gain: 0.35 },
  { sec: 1.5, sfx: 'swish', gain: 0.4 }, { sec: 2.0, sfx: 'squish', gain: 0.45 }, { sec: STAMP, sfx: 'scratch', gain: 0.6 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
