// This video's own hook.
//
// The idea: 4:58 am, still dark. The alarm clock rings, Roma Tom drags himself out of bed with
// droopy eyes, and outside the window the sun peeks up as he flips the cafe lights on, one by one.
// Frame one shows: the alarm clock already ringing and shaking.
// Readable by 0.5 s: "Cafe owners, *this one's for you*."
// The open loop: a kind word coming, not a tip.
//
// props: { label, line, time }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const UP = 1.0, LIGHTS = [1.8, 2.2, 2.6], FLOOR = 1460;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;

  // The window: night, then the sun peeking up.
  const sun = S.at(sec, 1.4, 3.2);
  pen.shape(ctx, pen.roundRect(600, 650, 380, 300, 14), { fill: sun > 0.3 ? C.butter : C.ink, width: 7, seed: 28101, offset: 0 });
  ctx.save(); ctx.beginPath(); ctx.rect(606, 656, 368, 288); ctx.clip();
  pen.shape(ctx, pen.ellipse(790, 1010 - sun * 230, 80, 80, 28), { fill: C.card, width: 5, seed: 28102, offset: 0 });
  ctx.restore();
  pen.line(ctx, [{ x: 790, y: 650 }, { x: 792, y: 950 }], { width: 6, seed: 28103 });
  pen.line(ctx, [{ x: 600, y: 800 }, { x: 980, y: 798 }], { width: 6, seed: 28104 });

  kicker(ctx, props.label || '', W / 2, 260, { seed: 28105 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 28106 });

  // Three lamps along the left, clicking on one by one.
  LIGHTS.forEach((s, i) => {
    const x = 120 + i * 160, on = sec >= s;
    pen.line(ctx, [{ x, y: 600 }, { x, y: 700 }], { width: 4, color: theme.soft, seed: 28110 + i });
    pen.shape(ctx, [{ x: x - 50, y: 700 }, { x: x + 50, y: 700 }, { x: x + 70, y: 760 }, { x: x - 70, y: 760 }], { fill: C.ink, width: 4, seed: 28114 + i, offset: 0 });
    pen.shape(ctx, pen.ellipse(x, 770, 22, 16, 14), { fill: on ? C.butter : C.muted, width: 4, seed: 28118 + i, offset: 0 });
    if (on && sec < s + 0.35) [-0.7, 0, 0.7].forEach((a, k) => pen.line(ctx, [{ x: x + Math.sin(a) * 40, y: 790 + Math.cos(a) * 40 }, { x: x + Math.sin(a) * 75, y: 790 + Math.cos(a) * 75 }], { width: 5, color: C.card, seed: 28122 + i * 3 + k }));
  });

  // Roma Tom, rising sleepily from bed, then upright with a little stretch.
  const up = S.at(sec, UP, UP + 0.6);
  pen.shape(ctx, pen.roundRect(140, FLOOR - 170, 520, 170, 26), { fill: C.card, width: 7, seed: 28130, offset: 0 });
  tomato(ctx, 'Roma Tom', 380 + up * 20, 1250 - up * 90, 440, { angle: -1.2 * (1 - up) + Math.sin(sec * 1.5) * 0.04 * up, squash: S.breathe(sec * 0.5), mouth: sec > UP + 0.6 && sec < UP + 1.3 ? 0.9 : undefined });
  pen.shape(ctx, [{ x: 390, y: FLOOR - 150 }, { x: 650 - up * 120, y: FLOOR - 160 }, { x: 650, y: FLOOR }, { x: 390, y: FLOOR }], { fill: C.blush, width: 7, seed: 28131, offset: 0 });
  if (sec < UP) [0, 1, 2].forEach((i) => {
    const ph = (sec * 0.8 + i / 3) % 1;
    text(ctx, 'z', 560 + ph * 40 + i * 6, 1150 - ph * 140, { size: 44 + i * 10, alpha: 1 - ph, color: theme.soft });
  });
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 28132 });

  // The alarm clock on the floor, ringing until he's up.
  const ring = sec < UP + 0.2 ? Math.sin(sec * 70) * 8 : 0;
  pen.shape(ctx, pen.roundRect(760 + ring, FLOOR - 120, 200, 120, 18), { fill: C.ink, width: 6, seed: 28140, offset: 0 });
  text(ctx, props.time || '', 860 + ring, FLOOR - 40, { size: 64, align: 'center', color: C.lime });
  if (ring) [-1, 1].forEach((d, i) => pen.line(ctx, [{ x: 860 + d * 120, y: FLOOR - 150 }, { x: 860 + d * 145, y: FLOOR - 120 }, { x: 860 + d * 120, y: FLOOR - 90 }], { width: 6, color: theme.text, seed: 28141 + i }));
}

hook.cues = () => [
  { sec: 0, sfx: 'blip', gain: 0.45 }, { sec: 0.3, sfx: 'blip', gain: 0.45 }, { sec: 0.6, sfx: 'blip', gain: 0.45 }, { sec: 0.9, sfx: 'blip', gain: 0.45 },
  { sec: UP, sfx: 'squish', gain: 0.35 }, ...LIGHTS.map((sec) => ({ sec, sfx: 'tick', gain: 0.5 })),
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
