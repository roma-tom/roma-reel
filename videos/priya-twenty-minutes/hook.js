// This video's own hook.
//
// The idea: Priya stands at the pickup counter tapping her foot while the wall clock spins and
// latte after latte slides out along the counter and off to someone else; her eyes follow
// every cup, and none of them is hers.
// Frame one shows: a cup already sliding past her, the clock hands already spinning, Priya mid-tap.
// Readable by 0.5 s: her line in a bubble, "Twenty minutes. For *one latte*.", and the PICKUP sign.
// The open loop: a guest is fed up at your counter. Does she ever come back?
//
// props: { label, line, sign }

const { W, C, kicker, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const TOP = 1130, FLOOR = 1560, CX0 = 600, GAP = 0.62, SLIDE = 0.9;
const TAKERS = ['Leo', 'Kim', 'Jo', 'Sam', 'Ivan', 'Rosa', 'Theo'];

function pickup(ctx, theme, sign) {
  // the floor
  pen.shape(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }, { x: 1120, y: 1980 }, { x: -40, y: 1980 }], { fill: C.line, width: 6, seed: 7301, offset: 0 });
  // the counter top and front
  pen.shape(ctx, [{ x: 500, y: TOP - 26 }, { x: 1120, y: TOP - 32 }, { x: 1120, y: TOP + 16 }, { x: 500, y: TOP + 22 }], { fill: C.card, width: 6, seed: 7302, offset: 0 });
  pen.shape(ctx, [{ x: 530, y: TOP + 22 }, { x: 1120, y: TOP + 16 }, { x: 1120, y: FLOOR }, { x: 530, y: FLOOR }], { fill: C.card, width: 6, seed: 7303, offset: 0 });
  // the PICKUP sign hanging on the counter front
  pen.shape(ctx, pen.roundRect(600, TOP + 80, 340, 110, 14), { fill: C.butter, width: 5, seed: 7304, offset: 0 });
  text(ctx, sign, 770, TOP + 158, { size: 64, align: 'center' });
}

function togo(ctx, x, y, seed) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1.35, 1.35); ctx.translate(-x, -y);
  pen.shape(ctx, [{ x: x - 40, y: y - 120 }, { x: x + 40, y: y - 120 }, { x: x + 30, y }, { x: x - 30, y }], { fill: C.card, width: 5, seed, offset: 0 });
  pen.shape(ctx, pen.roundRect(x - 48, y - 140, 96, 24, 8), { fill: C.ink, width: 3, seed: seed + 1, offset: 0 });
  pen.shape(ctx, [{ x: x - 36, y: y - 80 }, { x: x + 36, y: y - 80 }, { x: x + 33, y: y - 44 }, { x: x - 33, y: y - 44 }], { fill: C.tomato, width: 4, seed: seed + 2, offset: 0 });
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3;

  kicker(ctx, props.label || '', W / 2 - 60, 250, { seed: 7310 });

  // The wall clock above the counter, spinning: time passing while she waits.
  const mins = 7 * 60 + 40 + sec * 380;
  S.clock(ctx, theme, 900, 760, 95, Math.floor(mins / 60), mins % 60, 1, 7320);

  // Someone else pops up behind the far end of the counter for every cup, and takes it.
  for (let i = -1; i < 6; i++) {
    const a = i * GAP;
    const up = S.seg(sec, a + 0.45, a + 0.7) - S.seg(sec, a + 1.0, a + 1.25);
    if (up <= 0) continue;
    tomato(ctx, TAKERS[(i + 1) % TAKERS.length], 1000, TOP + 60 - S.easeOut(up) * 190, 400, { squash: S.breathe(sec), angle: -0.1 });
  }

  pickup(ctx, theme, props.sign || '');

  // Cups slide out one after another along the counter to the far end: someone else's.
  let nearest = 1;
  for (let i = -1; i < 6; i++) {
    const a = i * GAP;
    const p = S.seg(sec, a, a + SLIDE);
    if (p <= 0 || p >= 1) continue;
    const pe = S.easeInOut(p);
    const x = CX0 + pe * 400;
    togo(ctx, x, TOP - 26, 7340 + ((i + 1) % 6) * 4);
    pen.line(ctx, [{ x: x - 80, y: TOP - 90 }, { x: x - 140, y: TOP - 90 }], { width: 5, color: theme.text, seed: 7370 + i, alpha: 0.7 * Math.sin(Math.PI * p) });
    pen.line(ctx, [{ x: x - 90, y: TOP - 130 }, { x: x - 130, y: TOP - 130 }], { width: 5, color: theme.text, seed: 7376 + i, alpha: 0.7 * Math.sin(Math.PI * p) });
    nearest = Math.min(nearest, pe);
  }

  // Priya taps her foot on the floor to the left, leaning toward each cup as it goes by.
  const tap = Math.max(0, Math.sin(sec * 11));
  const lean = 0.05 + 0.1 * (1 - nearest);
  const px = 270;
  tomato(ctx, 'Priya', px, FLOOR - 330 - tap * 12, 780, { squash: S.breathe(sec) + tap * 0.03, angle: lean });
  [0, 1].forEach((k) => pen.line(ctx, [{ x: px - 200 - k * 34, y: FLOOR - 30 - k * 30 }, { x: px - 245 - k * 34, y: FLOOR - 55 - k * 30 }],
    { width: 5, color: theme.text, seed: 7380 + k, alpha: tap }));
  S.reaction(ctx, theme, 'sweat', px, FLOOR - 420, S.seg(sec, 1.0, 1.5));

  // Her line, in a bubble, readable from the start.
  S.say(ctx, props.line || '', { x: 70, y: 330, w: 700, tx: px + 30, ty: FLOOR - 640, k: S.pop(sec, 0, 0.3), size: 84, seed: 7390 });
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.35 },
  ...[0.62, 1.24, 1.86, 2.48].map((sec) => ({ sec, sfx: 'swish', gain: 0.25 })),
  ...[0.3, 0.9, 1.5, 2.1].map((sec) => ({ sec, sfx: 'tick', gain: 0.3 })),
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
