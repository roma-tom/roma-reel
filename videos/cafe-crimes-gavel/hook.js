// This video's own hook.
//
// The idea: Roma Tom as a judge behind the bench, banging a gavel; with each bang a score card
// flips up, higher each time, and the last one makes him jump.
// Frame one shows: the gavel already coming down for the first bang.
// Readable by 0.5 s: "Rate these *cafe crimes*."
// The open loop: which crimes, and which one is unforgivable?
//
// props: { label, line, scores: [three numbers as text] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const BANGS = [0.25, 1.15, 2.05], BENCH = 1260, CARDS = [250, 540, 830];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 22101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 22102 });

  // Score cards flipping up after each bang.
  const scores = props.scores || [];
  CARDS.forEach((x, i) => {
    const k = S.pop(sec, BANGS[i] + 0.05, 0.3);
    if (k <= 0) return;
    S.popIn(ctx, k, x, 810, () => {
      pen.shape(ctx, pen.roundRect(x - 100, 610, 200, 200, 18), { fill: i === 2 ? theme.mark : C.card, width: 6, seed: 22110 + i, offset: 0 });
      text(ctx, scores[i] || '', x, 765, { size: 150, align: 'center', color: i === 2 ? theme.accent : C.ink });
    });
  });

  // The judge behind the bench, jumping at the last score.
  const j = S.jump(sec, BANGS[2] + 0.1, 60);
  tomato(ctx, 'Roma Tom', 470, 1110 - j.hop, 460, { squash: j.squash, angle: -0.06 });
  if (sec > BANGS[2] + 0.1) S.reaction(ctx, theme, 'shock', 470, 1060, S.seg(sec, BANGS[2] + 0.1, BANGS[2] + 0.5));
  pen.shape(ctx, [{ x: 80, y: BENCH }, { x: 1000, y: BENCH - 4 }, { x: 1000, y: 1520 }, { x: 80, y: 1524 }], { fill: C.ink, width: 6, seed: 22120, offset: 0 });
  pen.line(ctx, [{ x: 120, y: BENCH + 60 }, { x: 960, y: BENCH + 56 }], { width: 5, color: C.muted, seed: 22121 });

  // The gavel: raised, then slammed down on each bang.
  const last = BANGS.filter((b) => b <= sec + 0.25).length - 1;
  const since = last >= 0 ? sec - BANGS[last] : 1;
  const raise = since < 0 ? Math.min(1, -since / 0.25) : Math.min(1, Math.max(0, (since - 0.15) / 0.4));
  const a = 0.9 * raise;
  ctx.save(); ctx.translate(820, BENCH - 20); ctx.rotate(a);
  pen.line(ctx, [{ x: 0, y: 0 }, { x: -170, y: -40 }], { width: 14, color: C.muted, seed: 22130 });
  pen.shape(ctx, pen.roundRect(-230, -90, 70, 110, 14), { fill: C.rose, width: 6, seed: 22131, offset: 0 });
  ctx.restore();
  pen.shape(ctx, pen.roundRect(560, BENCH - 30, 160, 34, 8), { fill: C.card, width: 5, seed: 22132, offset: 0 });
  BANGS.forEach((b, i) => { if (sec > b && sec < b + 0.18) [-1, 1].forEach((d, k) => pen.line(ctx, [{ x: 640 + d * 110, y: BENCH - 60 }, { x: 640 + d * 150, y: BENCH - 100 }], { width: 7, color: theme.text, seed: 22140 + i * 2 + k })); });
}

hook.cues = () => BANGS.map((sec, i) => ({ sec, sfx: i === 2 ? 'boing' : 'tap', gain: 0.7 })).concat(BANGS.map((sec) => ({ sec: sec + 0.05, sfx: 'pop', gain: 0.35 })));
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
