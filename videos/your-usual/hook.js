// This video's own hook.
//
// The idea: three cups slide onto the counter one after another, each with its order on the
// sleeve, and as each lands its regular pops up behind it, as if the cup summoned them.
// Frame one shows: the first cup already sliding in.
// Readable by 0.5 s: "Your usual *says a lot*."
// The open loop: what does each order say about the person?
//
// props: { label, line, cups: [three words], names: [three names] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const COUNTER = 1300, SPOTS = [230, 540, 850], LAND = [0.4, 1.2, 2.0];

function cup(ctx, x, y, word, seed) {
  pen.shape(ctx, [{ x: x - 80, y: y - 230 }, { x: x + 80, y: y - 230 }, { x: x + 62, y }, { x: x - 62, y }], { fill: C.card, width: 6, seed, offset: 0 });
  pen.shape(ctx, pen.roundRect(x - 92, y - 262, 184, 40, 12), { fill: C.ink, width: 4, seed: seed + 1, offset: 0 });
  pen.shape(ctx, [{ x: x - 76, y: y - 160 }, { x: x + 76, y: y - 160 }, { x: x + 68, y: y - 80 }, { x: x - 68, y: y - 80 }], { fill: C.butter, width: 4, seed: seed + 2, offset: 0 });
  text(ctx, word, x, y - 104, { size: 38, align: 'center', font: 'Inter', weight: 700, spacing: 2 });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 20101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 20102 });

  const cups = props.cups || [], names = props.names || [];
  // Each regular pops up behind their cup as it lands.
  SPOTS.forEach((x, i) => {
    const k = S.pop(sec, LAND[i] + 0.1, 0.35);
    if (k > 0 && names[i]) tomato(ctx, names[i], x, 985 + (1 - k) * 300, 380, { squash: S.breathe(sec + i), angle: Math.sin(sec * 2 + i) * 0.05 });
  });
  S.counter(ctx, COUNTER);
  SPOTS.forEach((x, i) => {
    const p = S.at(sec, LAND[i] - 0.4, LAND[i]);
    if (p <= 0) return;
    const cx = x + (1 - p) * (W + 200 - x);
    ctx.save(); ctx.translate(cx, COUNTER + 10); ctx.scale(0.72, 0.72); cup(ctx, 0, 0, cups[i] || '', 20110 + i * 5); ctx.restore();
    if (p < 1) [0, 1].forEach((j) => pen.line(ctx, [{ x: cx + 110 + j * 30, y: COUNTER - 140 + j * 50 }, { x: cx + 180 + j * 30, y: COUNTER - 140 + j * 50 }], { width: 6, color: theme.text, seed: 20130 + j }));
  });
}

hook.cues = () => LAND.flatMap((s) => [{ sec: s - 0.4, sfx: 'swish', gain: 0.35 }, { sec: s, sfx: 'clink', gain: 0.45 }, { sec: s + 0.1, sfx: 'pop', gain: 0.35 }]);
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
