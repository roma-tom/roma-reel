// This video's own hook.
//
// The idea: Priya at the pickup counter, tapping her foot, while the wall clock's minute hand
// races round and drink after drink slides out to other guests, past her; her face falls a bit
// more with each one, and a small "20 min" tag pops up over her head.
// Frame one shows: a cup already sliding past Priya, the clock hand already racing.
// Readable by 0.5 s: "Twenty minutes. *For one latte.*"
// The open loop: does she ever come back?
//
// props: { label, line, wait }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const COUNTER = 1300, CUPS = [0.0, 0.7, 1.4, 2.1];
const TAKERS = ['Leo', 'Sam', 'Ivan', 'Ana'];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 42101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 42102 });

  // The wall clock, its minute hand racing through twenty minutes.
  const min = 5 + 20 * Math.min(1, sec / 2.8);
  S.clock(ctx, theme, 830, 720, 120, 8, min, 1, 42103);
  pen.line(ctx, [{ x: 830 + 140, y: 640 }, { x: 830 + 170, y: 620 }], { width: 6, color: theme.text, seed: 42104 });
  pen.line(ctx, [{ x: 830 - 140, y: 640 }, { x: 830 - 170, y: 620 }], { width: 6, color: theme.text, seed: 42105 });

  // Priya at the pickup end, tapping her foot, getting glummer as each drink goes to someone else.
  const glum = Math.min(1, sec / 2.6);
  const tap = Math.abs(Math.sin(sec * 9)) * 10;
  tomato(ctx, 'Priya', 330, 1170 - tap, 460, { angle: -0.08 - glum * 0.08, squash: S.breathe(sec), mouth: glum > 0.6 ? 0.5 : undefined });
  S.reaction(ctx, theme, 'sweat', 320, 1110, S.seg(sec, 1.0, 1.6));
  const tagK = S.pop(sec, 2.6, 0.3);
  S.popIn(ctx, tagK, 330, 880, () => {
    pen.shape(ctx, pen.roundRect(220, 840, 220, 84, 18), { fill: C.card, width: 5, seed: 42106, offset: 0 });
    text(ctx, props.wait || '', 330, 898, { size: 58, align: 'center', color: theme.accent });
  });

  // Each drink slides in, stops just short of Priya, and someone else pops up, grabs it and goes.
  CUPS.forEach((s0, i) => {
    const slide = S.at(sec, s0, s0 + 0.35);
    if (slide <= 0) return;
    const grab = S.pop(sec, s0 + 0.3, 0.25);
    const away = S.at(sec, s0 + 0.55, s0 + 0.95, (v) => v * v);
    if (away >= 1) return;
    const x = 1180 - slide * 470 + away * 600;
    if (grab > 0) tomato(ctx, TAKERS[i], x + 30, 1180 - (1 - grab) * 120, 260, { angle: -0.1, scale: grab });
    S.cup(ctx, x - 60, COUNTER, 1.1);
  });
  S.counter(ctx, COUNTER);
}

hook.cues = () => CUPS.map((sec) => ({ sec, sfx: 'swish', gain: 0.35 })).concat([{ sec: 0.4, sfx: 'tick', gain: 0.3 }, { sec: 1.2, sfx: 'tick', gain: 0.3 }, { sec: 2.0, sfx: 'tick', gain: 0.3 }, { sec: 2.6, sfx: 'pop', gain: 0.45 }]);
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
