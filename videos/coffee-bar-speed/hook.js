// This video's own hook.
//
// The idea: a second barista joins Ana behind the small bar, and they both lunge for the one
// milk jug and bonk heads, while the line at the counter taps its feet.
// Frame one shows: both baristas already leaning in for the jug.
// Readable by 0.5 s: "More staff, *faster line*? Not always."
// The open loop: then how do you speed up the bar?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const COUNTER = 1260, BONK = 0.9, AGAIN = 2.2;
const LINE = [['Maria', 200], ['Priya', 420], ['Sam', 640], ['Ivan', 860]];

function jug(ctx, x, y) {
  pen.shape(ctx, [{ x: x - 40, y: y - 110 }, { x: x + 40, y: y - 110 }, { x: x + 50, y }, { x: x - 50, y }], { fill: C.card, width: 6, seed: 24110, offset: 0 });
  pen.shape(ctx, [{ x: x + 40, y: y - 110 }, { x: x + 75, y: y - 130 }, { x: x + 45, y: y - 95 }], { fill: C.card, width: 5, seed: 24111, offset: 0 });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 24101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 24102 });

  // Two lunges at the jug, each ending in a bonk.
  const lunge = (s) => Math.max(S.at(s, 0, BONK, (x) => x * x), 0) * (s < BONK + 0.15 ? 1 : 1 - S.at(s, BONK + 0.15, BONK + 0.6));
  const l = Math.max(lunge(sec), lunge(sec - (AGAIN - 0.2)));
  const bonked = (sec > BONK && sec < BONK + 0.6) || (sec > AGAIN + 0.7 && sec < AGAIN + 1.3);
  tomato(ctx, 'Ana', 310 + l * 130, 1030, 480, { angle: 0.25 * l, squash: bonked ? 1.12 : S.breathe(sec) });
  tomato(ctx, 'Leo', 770 - l * 130, 1030, 480, { angle: -0.25 * l, squash: bonked ? 1.12 : S.breathe(sec + 1) });
  if (bonked) {
    [[-1.0], [-0.5], [0.5], [1.0]].forEach(([a], i) => pen.line(ctx, [{ x: 540 + Math.sin(a) * 60, y: 860 - Math.cos(a) * 60 }, { x: 540 + Math.sin(a) * 120, y: 860 - Math.cos(a) * 120 }], { width: 8, color: theme.accent, seed: 24120 + i }));
    pen.sparkle(ctx, 470, 860, 26, { fill: C.butter, seed: 24125 });
    pen.sparkle(ctx, 620, 840, 22, { fill: C.butter, seed: 24126 });
  }
  S.counter(ctx, COUNTER);
  ctx.save(); ctx.translate(540, COUNTER + 6); ctx.scale(1.5, 1.5); jug(ctx, 0, 0); ctx.restore();

  // The line at the counter, tapping its feet.
  LINE.forEach(([name, x], i) => {
    const tap = Math.abs(Math.sin(sec * 7 + i * 1.3)) * 10;
    tomato(ctx, name, x, 1560 - tap, 240, { angle: Math.sin(sec * 3 + i) * 0.05 });
  });
}

hook.cues = () => [
  { sec: 0, sfx: 'tick', gain: 0.3 }, { sec: BONK, sfx: 'boing', gain: 0.55 }, { sec: BONK + 0.02, sfx: 'clink', gain: 0.35 },
  { sec: AGAIN + 0.7, sfx: 'boing', gain: 0.55 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
