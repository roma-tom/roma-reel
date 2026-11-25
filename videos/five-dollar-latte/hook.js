// This video's own hook.
//
// The idea: a $5 bill slides across the counter toward Roma Tom, and before he can take it a pair
// of scissors snips it into strips that fly off one by one, each labeled with where it goes
// (milk, cup, staff, rent, card fee), until a single small coin is all that's left in front of him.
// Frame one shows: the $5 bill already sliding in, the scissors opening.
// Readable by 0.5 s: "$5 a latte. You keep *how much*?"
// The open loop: how much is that coin?
//
// props: { label, line, bill, strips: [labels] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const COUNTER = 1400, B = { cx: 540, cy: 860, w: 800, h: 360 }, SNIP0 = 0.7, GAP = 0.32;
// Where each strip lands, around the frame, so its label stays readable.
const LAND = [[160, 700, -0.3], [920, 680, 0.25], [150, 1060, 0.2], [920, 900, -0.25], [380, 1230, 0.1]];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 41101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 41102 });

  const strips = props.strips || [];
  const n = strips.length, sw = B.w / n;
  const slide = S.at(sec, 0, 0.5);
  const bx = B.cx + (1 - slide) * 700;

  // The bill, cut into vertical strips; each strip flies off when its snip happens.
  strips.forEach((label, i) => {
    const s0 = SNIP0 + i * GAP, f = S.at(sec, s0, s0 + 0.45);
    const x0 = bx - B.w / 2 + i * sw + sw / 2;
    const [lx, ly, la] = LAND[i % LAND.length];
    const x = x0 + (lx - x0) * f, y = B.cy + (ly - B.cy) * f - Math.sin(Math.PI * f) * 120;
    ctx.save(); ctx.translate(x, y); ctx.rotate(f * (Math.PI / 2 + la)); ctx.scale(1 - 0.25 * f, 1 - 0.25 * f);
    pen.shape(ctx, pen.roundRect(-sw / 2, -B.h / 2, sw, B.h, 6), { fill: C.mint, width: 5, seed: 41110 + i, offset: 0 });
    if (f > 0) { ctx.rotate(-Math.PI / 2); text(ctx, label, 0, 18, { size: 54, align: 'center', font: 'Inter', weight: 800, color: C.forestDark }); }
    ctx.restore();
  });
  // While intact, draw the bill's big "$5" across the middle.
  if (sec < SNIP0) {
    pen.line(ctx, pen.roundRect(bx - B.w / 2 + 20, B.cy - B.h / 2 + 20, B.w - 40, B.h - 40, 8), { width: 3, color: C.forestDark, seed: 41130, closed: true });
    text(ctx, props.bill || '', bx, B.cy + 55, { size: 170, align: 'center', color: C.forestDark });
  }
  // The scissors, snipping up through the bill strip by strip.
  const k = Math.min(n - 1, Math.max(0, Math.floor((sec - SNIP0) / GAP)));
  if (sec > SNIP0 - 0.3 && sec < SNIP0 + n * GAP) {
    const sx = bx - B.w / 2 + (k + 1) * sw, open = Math.abs(Math.sin(sec * 18)) * 0.35;
    ctx.save(); ctx.translate(sx, B.cy + B.h / 2 + 40);
    [-1, 1].forEach((d, i) => {
      ctx.save(); ctx.rotate(-Math.PI / 2 + d * open);
      pen.line(ctx, [{ x: 0, y: 0 }, { x: 190, y: 0 }], { width: 11, seed: 41140 + i });
      pen.shape(ctx, pen.ellipse(-50, d * 30, 34, 24, 14), { fill: C.rose, width: 5, seed: 41142 + i, offset: 0 });
      ctx.restore();
    });
    ctx.restore();
  }

  // The coin left behind, and Roma Tom staring at it.
  const left = SNIP0 + n * GAP + 0.3;
  const ck = S.pop(sec, left, 0.35);
  if (ck > 0) S.popIn(ctx, ck, B.cx, COUNTER - 60, () => { pen.shape(ctx, pen.ellipse(B.cx, COUNTER - 60, 60, 60, 28), { fill: C.card, width: 7, seed: 41150, offset: 0 }); pen.shape(ctx, pen.ellipse(B.cx, COUNTER - 60, 40, 40, 24), { fill: C.line, width: 4, seed: 41151, offset: 0 }); });
  tomato(ctx, 'Roma Tom', 820, 1270, 420, { squash: S.breathe(sec), angle: sec > left ? -0.12 : 0, mouth: sec > left + 0.2 ? 0.8 : undefined });
  if (sec > left) S.reaction(ctx, theme, 'shock', 820, 1220, S.seg(sec, left, left + 0.4));
  S.counter(ctx, COUNTER);
}

hook.cues = (props = {}) => {
  const n = (props.strips || []).length || 5;
  return [{ sec: 0, sfx: 'swish', gain: 0.4 }]
    .concat(Array.from({ length: n }, (_, i) => ({ sec: SNIP0 + i * GAP, sfx: 'scratch', gain: 0.35 })))
    .concat([{ sec: SNIP0 + n * GAP + 0.3, sfx: 'clink', gain: 0.6 }]);
};
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
