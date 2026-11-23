// This video's own hook.
//
// The idea: Roma Tom juggling five things at once, a cup, a phone, a broom, a receipt and a
// wrench, faster and faster, wobbling; then he tosses one away to Ana, who catches it, and the
// juggling settles down to a calm, slow loop.
// Frame one shows: everything already in the air, mid-juggle.
// Readable by 0.5 s: "Doing every job? *Drop one.*"
// The open loop: which one do you hand off first?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const TOSS = 2.0, CX = 430, CY = 1220, FLOOR = 1520;

function item(ctx, kind, x, y, seed) {
  if (kind === 0) S.cup(ctx, x, y + 40, 0.6);
  else if (kind === 1) { pen.shape(ctx, pen.roundRect(x - 30, y - 50, 60, 100, 12), { fill: C.ink, width: 4, seed, offset: 0 }); pen.fill(ctx, pen.roundRect(x - 22, y - 40, 44, 74, 6), C.sky, { seed: seed + 1 }); }
  else if (kind === 2) { pen.line(ctx, [{ x: x - 10, y: y - 70 }, { x: x + 10, y: y + 30 }], { width: 8, color: C.muted, seed }); pen.shape(ctx, [{ x: x - 20, y: y + 30 }, { x: x + 40, y: y + 30 }, { x: x + 50, y: y + 70 }, { x: x - 30, y: y + 70 }], { fill: C.butter, width: 4, seed: seed + 1, offset: 0 }); }
  else if (kind === 3) { pen.shape(ctx, pen.roundRect(x - 34, y - 50, 68, 100, 4), { fill: C.card, width: 4, seed, offset: 0 }); [-25, 0, 25].forEach((d, i) => pen.line(ctx, [{ x: x - 20, y: y + d }, { x: x + 18, y: y + d }], { width: 4, color: C.muted, seed: seed + 2 + i })); }
  else { pen.line(ctx, [{ x: x - 30, y: y + 40 }, { x: x + 20, y: y - 20 }], { width: 12, color: C.muted, seed }); pen.shape(ctx, pen.ellipse(x + 26, y - 28, 22, 22, 14), { fill: C.muted, width: 4, seed: seed + 1, offset: 0 }); }
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 38101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 38102 });

  const tossed = sec >= TOSS;
  const speed = tossed ? 2.2 : 4 + sec * 2.5;
  const wobble = tossed ? 0 : Math.sin(sec * 18) * 0.06 * Math.min(1, sec);
  tomato(ctx, 'Roma Tom', CX, CY, 520, { angle: wobble, squash: S.breathe(sec) });
  if (!tossed) S.reaction(ctx, theme, 'sweat', CX, CY - 40, S.seg(sec, 0.5, 1.1));
  else S.reaction(ctx, theme, 'joy', CX, CY - 40, S.seg(sec, TOSS + 0.6, TOSS + 1.2));

  // The juggled items orbit above his head; after the toss there are four, on a slower loop.
  const kinds = tossed ? [0, 1, 2, 3] : [0, 1, 2, 3, 4];
  kinds.forEach((kind, i) => {
    const a = sec * speed + (i * Math.PI * 2) / kinds.length;
    const x = CX + Math.cos(a) * 260, y = 820 + Math.sin(a) * 150;
    ctx.save(); ctx.translate(x, y); ctx.scale(1.7, 1.7); item(ctx, kind, 0, 0, 38110 + kind * 5); ctx.restore();
  });
  // The wrench flying across to Ana.
  const f = S.at(sec, TOSS, TOSS + 0.6);
  if (tossed && f < 1) { ctx.save(); ctx.translate(CX + 260 + f * 220, 820 - Math.sin(Math.PI * f) * 160 + f * 300); ctx.scale(1.7, 1.7); ctx.rotate(f * 6); item(ctx, 4, 0, 0, 38130); ctx.restore(); }
  const j = S.jump(sec, TOSS + 0.6, 40);
  tomato(ctx, 'Ana', 900, 1340 - j.hop, 340, { squash: j.squash, angle: -0.08 });
  if (sec >= TOSS + 0.6) { ctx.save(); ctx.translate(910, 1120 - j.hop); ctx.scale(1.7, 1.7); item(ctx, 4, 0, 0, 38135); ctx.restore(); }
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 38140 });
}

hook.cues = () => [{ sec: 0, sfx: 'swish', gain: 0.3 }, { sec: 0.5, sfx: 'swish', gain: 0.3 }, { sec: 1.0, sfx: 'swish', gain: 0.35 }, { sec: 1.4, sfx: 'swish', gain: 0.4 }, { sec: 1.7, sfx: 'swish', gain: 0.45 }, { sec: TOSS, sfx: 'whoosh', gain: 0.45 }, { sec: TOSS + 0.6, sfx: 'pop', gain: 0.45 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
