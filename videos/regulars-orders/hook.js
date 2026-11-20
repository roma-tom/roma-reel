// This video's own hook.
//
// The idea: Roma Tom stands behind the counter like a fortune teller while three to-go cups
// slide down the counter toward him, each with its order scribbled on the side; as each one
// lands he leans in to read it, and when the last one stops he "knows" (sparkles).
// Frame one shows: the first cup already sliding in from the right, Roma Tom already leaning.
// Readable by 0.5 s: "Your usual says *who you are*." (THE USUAL pill above it).
// The open loop: what does each of these orders say about the guest who drinks it?
//
// props: { label, line, cups: ['…', '…', '…'] (the orders written on the cups) }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, wrapText } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const TOP = 1330;               // the counter's top edge
const SLOTS = [210, 470, 730];  // where the cups stop (clear of the right safe zone)
const LAND = [0.45, 0.9, 1.35]; // when each cup stops, in seconds
const KNOW = 1.8;               // Roma Tom "gets it"

// A to-go cup standing on y at x, with a sleeve and its order written on it.
function togo(ctx, theme, x, y, label, seed, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.translate(-x, -y);
  const h = 270, top = 92, bot = 70;
  pen.shape(ctx, [{ x: x - top, y: y - h }, { x: x + top, y: y - h }, { x: x + bot, y }, { x: x - bot, y }], { fill: C.card, width: 6, seed, offset: 0 });
  pen.shape(ctx, pen.roundRect(x - top - 12, y - h - 34, (top + 12) * 2, 36, 12), { fill: theme.text === C.ink ? C.ink : C.ink, width: 5, seed: seed + 1, offset: 0 });
  pen.shape(ctx, [{ x: x - top + 10, y: y - h + 70 }, { x: x + top - 10, y: y - h + 70 }, { x: x + top - 22, y: y - h + 200 }, { x: x - top + 22, y: y - h + 200 }], { fill: C.butter, width: 5, seed: seed + 2, offset: 0 });
  const lines = wrapText(label, 150, { size: 40, balance: true }).slice(0, 2);
  const y0 = y - h + 140 - ((lines.length - 1) * 40) / 2;
  lines.forEach((ln, i) => text(ctx, ln, x, y0 + i * 40, { size: 40, align: 'center' }));
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.2;
  const cups = (props.cups || []).slice(0, 3);

  kicker(ctx, props.label || '', W / 2 - 60, 260, { seed: 16201 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 330, size: 124, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 16202 });

  // Roma Tom behind the counter, leaning toward whichever cup just landed.
  const read = LAND.reduce((k, s, i) => (sec >= s - 0.1 ? i : k), 0);
  const lean = (SLOTS[read] - W / 2) / 2400;
  const j = S.jump(sec, KNOW, 40);
  tomato(ctx, 'Roma Tom', W / 2, TOP - 370 - j.hop, 580, { squash: j.squash, angle: lean + Math.sin(sec * 2.4) * 0.02 });
  S.reaction(ctx, theme, 'think', W / 2 + 60, TOP - 370, S.seg(sec, 0.2, 0.8) * (sec < KNOW ? 1 : 0));
  S.reaction(ctx, theme, 'joy', W / 2, TOP - 370 - j.hop, S.seg(sec, KNOW, KNOW + 0.6));

  S.counter(ctx, TOP);

  // The cups slide in from the right, one after another, with a little wobble as they stop.
  cups.forEach((label, i) => {
    const a = LAND[i] - 0.55, p = S.at(sec, a, LAND[i]);
    if (sec < a - 0.05 && i > 0) return;
    const x = 1260 + (SLOTS[i] - 1260) * p;
    const wob = sec > LAND[i] ? Math.sin((sec - LAND[i]) * 30) * 0.06 * Math.max(0, 1 - (sec - LAND[i]) * 3) : -0.04;
    if (p < 1) [0, 1, 2].forEach((k) => pen.line(ctx, [{ x: x + 110 + k * 30, y: TOP - 60 - k * 50 }, { x: x + 170 + k * 30, y: TOP - 60 - k * 50 }], { width: 5, color: theme.text, seed: 16210 + i * 3 + k, alpha: 0.6 }));
    togo(ctx, theme, x, TOP + 6, label, 16220 + i * 5, wob);
  });
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.4 },
  ...LAND.map((s) => ({ sec: s, sfx: 'tap', gain: 0.6 })),
  { sec: KNOW, sfx: 'chime', gain: 0.6 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
