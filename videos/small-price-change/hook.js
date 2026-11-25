// This video's own hook.
//
// The idea: Roma Tom answers the phone with a smile; Sam's voice bubble says "Just a small price
// change", and the price tag on the flour sack beside him swings, gets crossed out, and grows a
// bigger number, and a bigger tag, and a bigger one, until it dwarfs the sack.
// Frame one shows: the phone already ringing, Roma Tom reaching for it.
// Readable by 0.5 s: "*Just a small* price change."
// The open loop: how small is small? (Spoiler: not very.)
//
// props: { label, line, quote, prices: [three strings] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, strike } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1500, BUBBLE = 0.5, GROWS = [1.3, 2.0, 2.7];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 30101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 30102 });

  // Roma Tom on the phone, his smile fading as the tag grows.
  const worry = GROWS.filter((g) => sec >= g).length;
  tomato(ctx, 'Roma Tom', 300, 1270, 460, { squash: S.breathe(sec), angle: -0.06 - worry * 0.03, mouth: worry >= 3 ? 0.9 : undefined });
  pen.shape(ctx, pen.roundRect(360, 1170, 60, 130, 16), { fill: C.ink, width: 5, seed: 30103, offset: 0 });
  if (sec < BUBBLE) [-1, 1].forEach((d, i) => pen.line(ctx, [{ x: 390 + d * 60, y: 1160 }, { x: 390 + d * 80, y: 1190 }], { width: 6, color: theme.text, seed: 30104 + i }));
  if (worry >= 2) S.reaction(ctx, theme, 'sweat', 160, 1230, S.seg(sec, GROWS[1], GROWS[1] + 0.6));
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 30106 });

  // Sam's line, in a bubble from the phone.
  S.say(ctx, props.quote || '', { x: 70, y: 560, w: 470, tx: 390, ty: 1150, k: S.pop(sec, BUBBLE, 0.3), size: 70, seed: 30110 });

  // The flour sack and its tag, growing with each new price.
  const sx = 790;
  pen.shape(ctx, [{ x: sx - 130, y: FLOOR }, { x: sx + 130, y: FLOOR }, { x: sx + 110, y: FLOOR - 300 }, { x: sx + 70, y: FLOOR - 340 }, { x: sx - 70, y: FLOOR - 340 }, { x: sx - 110, y: FLOOR - 300 }], { fill: C.card, width: 6, seed: 30120, offset: 0 });
  pen.line(ctx, [{ x: sx - 90, y: FLOOR - 200 }, { x: sx + 90, y: FLOOR - 200 }], { width: 5, color: C.muted, seed: 30121 });
  const prices = props.prices || [];
  const stage = Math.max(0, Math.min(prices.length - 1, worry));
  const k = stage > 0 ? S.pop(sec, GROWS[stage - 1], 0.35) : 1;
  const scale = 1 + stage * 0.7;
  const swing = Math.sin(sec * 3) * 0.08;
  ctx.save(); ctx.translate(sx, FLOOR - 340); ctx.rotate(swing);
  pen.line(ctx, [{ x: 0, y: 0 }, { x: 0, y: -60 }], { width: 4, seed: 30122 });
  S.popIn(ctx, k, 0, -60, () => {
    ctx.save(); ctx.translate(0, -60); ctx.scale(scale, scale);
    pen.shape(ctx, [{ x: -60, y: -20 }, { x: 60, y: -20 }, { x: 80, y: -70 }, { x: 80, y: -160 }, { x: -80, y: -160 }, { x: -80, y: -70 }], { fill: C.butter, width: 5, seed: 30123 + stage, offset: 0 });
    if (stage > 0) { text(ctx, prices[stage - 1] || '', 0, -112, { size: 34, align: 'center', color: C.muted }); strike(ctx, -50, 50, -122, 1, theme.accent, 30130 + stage); }
    text(ctx, prices[stage] || '', 0, -40 - (stage > 0 ? 0 : 50), { size: stage > 0 ? 44 : 56, align: 'center', color: theme.accent });
    ctx.restore();
  });
  ctx.restore();
}

hook.cues = () => [
  { sec: 0, sfx: 'blip', gain: 0.45 }, { sec: 0.25, sfx: 'blip', gain: 0.45 }, { sec: BUBBLE, sfx: 'pop', gain: 0.4 },
  ...GROWS.map((sec, i) => ({ sec, sfx: i === 2 ? 'boing' : 'scratch', gain: 0.45 })),
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
