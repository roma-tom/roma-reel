// This video's own hook.
//
// The idea: day two, first rush. Theo stands dead still behind the bar holding a milk jug while
// tickets slam onto the rail above him one after another, the steam wand hisses, and the line in
// front of the counter grows; a pause sign pops over him.
// Frame one shows: the first ticket already slamming onto the rail.
// Readable by 0.5 s: "Day two. First rush. *Theo froze.*"
// The open loop: what should his first week have looked like?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const RAIL = 610, COUNTER = 1240, TICKETS = [0.0, 0.35, 0.65, 0.9, 1.1, 1.3, 1.5], PAUSE = 2.0;
const LINE = ['Maria', 'Leo', 'Sam', 'Ivan', 'Ana'];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 45101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 45102 });

  // The ticket rail filling up, each ticket slamming down from above.
  pen.line(ctx, [{ x: 60, y: RAIL }, { x: 1020, y: RAIL }], { width: 9, seed: 45103 });
  TICKETS.forEach((s0, i) => {
    const k = S.at(sec, s0, s0 + 0.15);
    if (k <= 0) return;
    const x = 130 + i * 135, y = RAIL - (1 - k) * 200;
    ctx.save(); ctx.translate(x, y); ctx.rotate(((i * 37) % 7 - 3) * 0.02);
    pen.shape(ctx, pen.roundRect(-55, 0, 110, 150, 6), { fill: C.card, width: 4, seed: 45110 + i, offset: 0 });
    [40, 75, 110].forEach((dy, r) => pen.line(ctx, [{ x: -35, y: dy }, { x: 30 - r * 10, y: dy }], { width: 4, color: C.muted, seed: 45120 + i * 3 + r }));
    ctx.restore();
  });

  // Theo frozen behind the counter, milk jug in hand; steam puffing from the wand beside him.
  tomato(ctx, 'Theo', 340, 1060, 460, { angle: 0, squash: 1, mouth: 0.6 });
  S.reaction(ctx, theme, 'sweat', 320, 1000, S.seg(sec, 0.8, 1.4));
  pen.shape(ctx, [{ x: 520, y: 1100 }, { x: 590, y: 1100 }, { x: 580, y: 1200 }, { x: 530, y: 1200 }], { fill: C.card, width: 5, seed: 45130, offset: 0 });
  pen.shape(ctx, pen.roundRect(660, 900, 220, 300, 18), { fill: C.rose, width: 6, seed: 45131, offset: 0 });
  pen.line(ctx, [{ x: 700, y: 1060 }, { x: 640, y: 1150 }], { width: 8, seed: 45132 });
  for (let i = 0; i < 5; i++) {
    const ph = (sec * 1.8 + i / 5) % 1, r = 18 + ph * 26;
    pen.shape(ctx, pen.ellipse(630 - ph * 60 + (i % 2) * 30, 1140 - ph * 200, r, r * 0.8, 16), { fill: C.card, width: 4, seed: 45140 + i, offset: 0, alpha: 1 - ph });
  }
  S.counter(ctx, COUNTER);

  // The line growing in front of the counter.
  LINE.forEach((name, i) => {
    const s0 = 0.4 + i * 0.35;
    if (sec < s0) return;
    const w = S.walk(sec, 1250, 180 + i * 180, s0, s0 + 0.6, 1490);
    tomato(ctx, name, w.x, w.y - 110, 230, { angle: w.angle });
  });

  // The pause sign over Theo.
  S.pauseSign(ctx, theme, 340, 860, S.pop(sec, PAUSE, 0.3));
}

hook.cues = () => TICKETS.map((sec) => ({ sec, sfx: 'tap', gain: 0.45 })).concat([{ sec: 0.2, sfx: 'swish', gain: 0.3 }, { sec: PAUSE, sfx: 'scratch', gain: 0.55 }]);
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
