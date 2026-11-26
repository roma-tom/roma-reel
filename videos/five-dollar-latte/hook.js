// This video's own hook.
//
// The idea: a five-dollar bill hangs over Roma Tom's counter and a pair of scissors snips it
// into strips, right to left; each strip flies off with what it pays for (beans, milk, cup,
// card fee, staff, rent) until one sliver is left, which drops onto the counter as a tiny coin
// with a question mark, while Roma Tom sweats.
// Frame one shows: the scissors already mid-snip on the bill.    Readable by 0.5 s: "$5 latte.
// Guess what you *keep*."    The open loop: how much of the five dollars is actually yours?
//
// props: { line, bill, cuts [up to 6 labels, cut right to left], left }

const { W, C, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const BX = 170, BY = 760, BW = 700, BH = 330, STRIPS = 7, SW = BW / STRIPS;
const START = 0.05, EVERY = 0.36, TOP = 1450;

// Each cut i (0 = rightmost strip) snips at this second.
const cutAt = (i) => START + i * EVERY;

// One strip of the bill, columns [c0, c1) of STRIPS, drawn at its place in the bill.
function strip(ctx, theme, props, c) {
  const x = BX + c * SW;
  pen.shape(ctx, [{ x, y: BY }, { x: x + SW, y: BY }, { x: x + SW, y: BY + BH }, { x, y: BY + BH }],
    { fill: C.mint, width: 5, seed: 4200 + c, offset: 0, color: C.forestDark });
  // The border and the big "$5" are clipped to this strip, so the bill reads whole until cut.
  ctx.save();
  ctx.beginPath(); ctx.rect(x, BY - 4, SW, BH + 8); ctx.clip();
  pen.line(ctx, pen.roundRect(BX + 26, BY + 26, BW - 52, BH - 52, 14), { width: 4, color: C.forestDark, seed: 4190, closed: true });
  pen.shape(ctx, pen.ellipse(BX + BW / 2, BY + BH / 2, 120, 120, 40), { fill: C.card, width: 4, seed: 4191, offset: 0, color: C.forestDark });
  text(ctx, props.bill || '$5', BX + BW / 2, BY + BH / 2 + 50, { size: 150, align: 'center', color: C.forestDark });
  text(ctx, props.bill || '$5', BX + 70, BY + 92, { size: 56, align: 'center', color: C.forestDark });
  text(ctx, props.bill || '$5', BX + BW - 70, BY + BH - 46, { size: 56, align: 'center', color: C.forestDark });
  ctx.restore();
}

// Scissors with the pivot at (x, y), blades pointing down, opened by `open` (0..1).
function scissors(ctx, x, y, open) {
  const a = 0.06 + open * 0.32;
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(s * a);
    pen.shape(ctx, [{ x: -10, y: 0 }, { x: 10, y: 0 }, { x: 3, y: 230 }, { x: -2, y: 230 }], { fill: C.card, width: 5, seed: 4300 + (s + 1), offset: 0 });
    pen.line(ctx, [{ x: 0, y: -10 }, { x: 0, y: -70 }], { width: 9, seed: 4303 + s });
    pen.shape(ctx, pen.ellipse(s * 26, -110, 36, 46, 30), { fill: C.rose, width: 6, seed: 4306 + s, offset: 0 });
    pen.shape(ctx, pen.ellipse(s * 26, -110, 16, 24, 20), { fill: C.butter, width: 4, seed: 4309 + s, offset: 0 });
    ctx.restore();
  }
  pen.shape(ctx, pen.ellipse(x, y, 10, 10, 12), { fill: C.ink, width: 0, seed: 4312, offset: 0 });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3;
  const cuts = (props.cuts || []).slice(0, STRIPS - 1);
  const n = cuts.length;

  headline(ctx, theme, props.line || '', { x: 540, y: 300, size: 116, maxW: 820, appear: S.at(sec, 0, 0.3), seed: 4101 });

  // Roma Tom behind the counter, looking up at his shrinking bill, sweating more with each cut.
  const done = cuts.filter((_, i) => sec >= cutAt(i)).length;
  const j = S.jump(sec, cutAt(Math.max(0, done - 1)) + 0.05, 24);
  tomato(ctx, 'Roma Tom', W / 2, 1340 - j.hop, 700, { squash: j.squash, angle: Math.sin(sec * 3) * 0.03 });
  S.reaction(ctx, theme, done >= n ? 'shock' : 'sweat', W / 2, 1250, S.at(sec, 0.3, 0.6));
  S.counter(ctx, TOP);

  // The strips still on the bill.
  const remaining = STRIPS - done;
  const lastGone = sec >= cutAt(n - 1) + 0.45;
  for (let c = 0; c < remaining; c++) {
    if (c === 0 && lastGone) continue;
    strip(ctx, theme, props, c);
  }

  // Each vacated column keeps the name of what took it, written sideways like a ledger.
  cuts.forEach((label, i) => {
    const k = S.pop(sec, cutAt(i) + 0.08, 0.3);
    if (k <= 0) return;
    const cx = BX + (STRIPS - 1 - i) * SW + SW / 2, cy = BY + BH / 2;
    S.popIn(ctx, k, cx, cy, () => {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2);
      text(ctx, label, 0, 22, { size: 64, align: 'center', color: theme.accent });
      ctx.restore();
    });
  });

  // Cut strips fall away.
  cuts.forEach((label, i) => {
    const p = S.seg(sec, cutAt(i), cutAt(i) + 1.1);
    if (p <= 0 || p >= 1) return;
    const c = STRIPS - 1 - i;
    const x0 = BX + c * SW + SW / 2, y0 = BY + BH / 2;
    const side = i % 2 ? -1 : 1;
    const x = x0 + side * (60 + 220 * p), y = y0 - 120 * p + 900 * p * p;
    ctx.save(); ctx.translate(x, y); ctx.rotate(side * p * 1.6);
    pen.shape(ctx, [{ x: -SW / 2, y: -BH / 2 }, { x: SW / 2, y: -BH / 2 }, { x: SW / 2, y: BH / 2 }, { x: -SW / 2, y: BH / 2 }],
      { fill: C.mint, width: 5, seed: 4220 + i, offset: 0, color: C.forestDark });
    ctx.restore();
  });

  // The last sliver drops to the counter as a small coin with a question mark.
  const drop = S.at(sec, cutAt(n - 1) + 0.35, cutAt(n - 1) + 0.7, S.easeInOut);
  if (sec >= cutAt(n - 1) + 0.35) {
    const cx = BX + SW / 2 + (W / 2 + 250 - BX - SW / 2) * drop, cy = BY + BH / 2 + (TOP - 50 - BY - BH / 2) * drop;
    const r = 80 - 10 * drop;
    pen.shape(ctx, pen.ellipse(cx, cy, r, r, 30), { fill: C.butter, width: 6, seed: 4400, offset: 0 });
    text(ctx, props.left || '?', cx, cy + r * 0.4, { size: r * 1.2, align: 'center', color: C.roseDark });
    if (drop >= 1) S.circle(ctx, theme, { x: cx, y: cy, rx: 105, ry: 95 }, S.at(sec, cutAt(n - 1) + 0.75, cutAt(n - 1) + 1.1));
  }

  // The scissors move to the next cut line and snap shut on each beat.
  if (sec < cutAt(n - 1) + 0.25) {
    const i = Math.min(n - 1, Math.max(0, Math.floor((sec - START + 0.18) / EVERY)));
    const lineX = BX + (STRIPS - 1 - i) * SW;
    const prevX = BX + (STRIPS - i) * SW;
    const mv = S.at(sec, cutAt(i) - 0.2, cutAt(i) - 0.05);
    const x = i === 0 ? lineX : prevX + (lineX - prevX) * mv;
    const open = sec < cutAt(i) ? 1 - S.seg(sec, cutAt(i) - 0.15, cutAt(i)) : S.seg(sec, cutAt(i), cutAt(i) + 0.2);
    scissors(ctx, x, BY - 40, open);
  }
}

hook.cues = (props = {}) => {
  const n = Math.min(STRIPS - 1, (props.cuts || []).length);
  const cues = [];
  for (let i = 0; i < n; i++) cues.push({ sec: cutAt(i), sfx: 'scratch', gain: 0.35 });
  cues.push({ sec: cutAt(n - 1) + 0.7, sfx: 'clink', gain: 0.5 });
  return cues;
};
hook.cover = (p) => ({ kicker: 'CAFE MATH', headline: p.line });

module.exports = hook;
