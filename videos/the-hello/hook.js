// This video's own hook.
//
// The idea: a flawless latte with heart art sits on the counter, sparkling, and nobody looks at
// it: Maria walks in, Roma Tom calls out her name, and she lights up and bounces.
// Frame one shows: Maria already walking in through the door.
// Readable by 0.5 s: "They come back for the *hello*."
// The open loop: if not the coffee, what keeps them coming back?
//
// props: { label, line, hello }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const COUNTER = 1300, HELLO = 0.8;

function latte(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  pen.shape(ctx, [{ x: -80, y: -150 }, { x: 80, y: -150 }, { x: 60, y: 0 }, { x: -60, y: 0 }], { fill: C.card, width: 6, seed: 23110, offset: 0 });
  pen.shape(ctx, pen.ellipse(0, -150, 80, 18, 24), { fill: C.butter, width: 5, seed: 23111, offset: 0 });
  // A heart in the foam.
  pen.shape(ctx, [{ x: 0, y: -140 }, { x: -22, y: -152 }, { x: -12, y: -162 }, { x: 0, y: -154 }, { x: 12, y: -162 }, { x: 22, y: -152 }], { fill: C.card, width: 3, seed: 23112, offset: 0 });
  pen.shape(ctx, [{ x: 80, y: -120 }, { x: 115, y: -110 }, { x: 110, y: -60 }, { x: 70, y: -50 }], { fill: 'transparent', width: 6, seed: 23113, offset: 0 });
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 23101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 23102 });

  // Roma Tom behind the counter.
  tomato(ctx, 'Roma Tom', 770, 1130, 520, { squash: S.breathe(sec), angle: sec > HELLO ? -0.08 : 0 });
  S.counter(ctx, COUNTER);
  // The perfect latte, sparkling away, unnoticed.
  latte(ctx, 540, COUNTER + 10, 1.1);
  [[430, 1050], [660, 1080], [560, 1000]].forEach(([x, y], i) => pen.sparkle(ctx, x, y, 18 + 6 * Math.sin(sec * 5 + i), { fill: C.card, seed: 23120 + i }));

  // Maria walks in, hears her name and bounces.
  const w = S.walk(sec, -40, 240, 0, 0.8, 1640);
  const j = S.jump(sec, HELLO + 0.25, 70);
  tomato(ctx, 'Maria', w.x, w.y - 260 - j.hop, 440, { angle: w.angle, squash: j.squash });
  if (sec > HELLO + 0.25) S.reaction(ctx, theme, 'joy', w.x, w.y - 260, S.seg(sec, HELLO + 0.25, HELLO + 0.9));

  // Roma Tom's hello.
  S.say(ctx, props.hello || '', { x: 360, y: 600, w: 540, tx: 720, ty: 890, k: S.pop(sec, HELLO, 0.3), size: 96, seed: 23130 });
}

hook.cues = () => [{ sec: 0, sfx: 'tap', gain: 0.3 }, { sec: 0.4, sfx: 'tap', gain: 0.3 }, { sec: HELLO, sfx: 'chime', gain: 0.5 }, { sec: HELLO + 0.25, sfx: 'boing', gain: 0.4 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
