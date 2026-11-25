// This video's own hook.
//
// The idea: Ivan opens the restroom door; inside, the paper towel dispenser is empty, the bin
// overflows and the light flickers. He looks back over his shoulder at the kitchen door, and a
// thought bubble shows the kitchen as he now imagines it: a mess, with a fly buzzing over it.
// Frame one shows: the restroom door swinging open, the light already flickering.
// Readable by 0.5 s: "Guests never see your kitchen."
// The open loop: so what do they judge it by?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1500, THINK = 1.8;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 34101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 34102 });

  // The restroom: a flickering light, an empty paper towel holder, an overflowing bin.
  const flick = (Math.floor(sec * 9) % 4 === 0) ? 0.3 : 0;
  pen.shape(ctx, pen.roundRect(520, 620, 480, FLOOR - 620, 12), { fill: C.card, width: 7, seed: 34103, offset: 0 });
  ctx.save(); ctx.globalAlpha = flick; ctx.fillStyle = C.ink; ctx.fillRect(522, 622, 476, FLOOR - 624); ctx.restore();
  pen.shape(ctx, pen.ellipse(760, 680, 40, 16, 16), { fill: flick ? C.muted : C.butter, width: 4, seed: 34104, offset: 0 });
  pen.shape(ctx, pen.roundRect(820, 860, 140, 120, 10), { fill: C.line, width: 5, seed: 34105, offset: 0 });
  pen.line(ctx, [{ x: 850, y: 985 }, { x: 930, y: 985 }], { width: 5, color: C.muted, seed: 34106 });
  pen.shape(ctx, [{ x: 600, y: FLOOR - 200 }, { x: 740, y: FLOOR - 200 }, { x: 720, y: FLOOR }, { x: 620, y: FLOOR }], { fill: C.line, width: 6, seed: 34107, offset: 0 });
  [[610, FLOOR - 230, 0.3], [660, FLOOR - 250, -0.2], [715, FLOOR - 226, 0.5], [640, FLOOR - 270, 0.1]].forEach(([x, y, a], i) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    pen.shape(ctx, pen.roundRect(-30, -20, 60, 40, 8), { fill: C.card, width: 4, seed: 34110 + i, offset: 0 });
    ctx.restore();
  });
  // The door swinging open, from shut to wide, at the start.
  const open = S.at(sec, 0, 0.6);
  pen.shape(ctx, [{ x: 520, y: 620 }, { x: 520 + 470 * (1 - open), y: 620 + 40 * open }, { x: 520 + 470 * (1 - open), y: FLOOR - 40 * open }, { x: 520, y: FLOOR }], { fill: C.sky, width: 6, seed: 34120, offset: 0 });

  // Ivan in the doorway, recoiling, then glancing back toward the kitchen.
  const back = S.at(sec, THINK - 0.4, THINK);
  tomato(ctx, 'Ivan', 280, 1290, 480, { angle: -0.12 - 0.1 * back, squash: S.breathe(sec), mouth: sec > 0.5 ? 0.6 : undefined });
  S.reaction(ctx, theme, 'sweat', 150, 1220, S.seg(sec, 0.6, 1.2));
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 34121 });

  // His thought: the kitchen he now imagines, with a fly buzzing over it.
  const k = S.pop(sec, THINK, 0.35);
  S.popIn(ctx, k, 220, 1020, () => {
    [[250, 1040, 14], [220, 990, 20]].forEach(([x, y, r], i) => pen.shape(ctx, pen.ellipse(x, y, r, r, 16), { fill: C.card, width: 4, seed: 34130 + i, offset: 0 }));
    pen.shape(ctx, pen.ellipse(250, 800, 210, 150, 32), { fill: C.card, width: 5, seed: 34132, offset: 0 });
    // A grimy stove with a pot and a spill.
    pen.shape(ctx, pen.roundRect(140, 800, 220, 110, 10), { fill: C.line, width: 5, seed: 34133, offset: 0 });
    pen.shape(ctx, [{ x: 170, y: 800 }, { x: 260, y: 800 }, { x: 250, y: 730 }, { x: 180, y: 730 }], { fill: C.muted, width: 5, seed: 34143, offset: 0 });
    [[300, 840, 22], [200, 870, 16], [320, 885, 12], [160, 840, 10]].forEach(([x, y, r], i) => pen.fill(ctx, pen.ellipse(x, y, r, r * 0.6, 10), C.ink, { seed: 34134 + i }));
    const fx = 320 + Math.sin(sec * 9) * 40, fy = 720 + Math.cos(sec * 13) * 20;
    pen.fill(ctx, pen.ellipse(fx, fy, 9, 7, 10), C.ink, { seed: 34140 });
    pen.shape(ctx, pen.ellipse(fx - 6, fy - 10, 8, 5, 8), { fill: C.card, width: 2, seed: 34141, offset: 0 });
    pen.shape(ctx, pen.ellipse(fx + 6, fy - 10, 8, 5, 8), { fill: C.card, width: 2, seed: 34142, offset: 0 });
  });
}

hook.cues = () => [{ sec: 0, sfx: 'scratch', gain: 0.35 }, { sec: 0.4, sfx: 'tick', gain: 0.3 }, { sec: 0.9, sfx: 'tick', gain: 0.3 }, { sec: THINK, sfx: 'pop', gain: 0.45 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
