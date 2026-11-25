// This video's own hook.
//
// The idea: Roma Tom behind the counter keeps bowing and saying sorry, and with each bow another
// "Sorry!" bubble pops up around him, until he's buried in them; then every one gets crossed
// out in rose, they fade away, and he stands up straight.
// Frame one shows: Roma Tom mid-bow, the first "Sorry!" popping up.
// Readable by 0.5 s: "Stop saying *sorry* for your prices."
// The open loop: then what do you say instead?
//
// props: { label, line, sorry }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, cross } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const BUBBLES = [[180, 760, 0.0], [820, 720, 0.4], [250, 1000, 0.8], [840, 980, 1.1], [500, 650, 1.4], [150, 1230, 1.65], [880, 1240, 1.9]];
const SLASH = 2.3, COUNTER = 1420;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 33101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 33102 });

  // Roma Tom bowing again and again, then standing up straight after the slash.
  const bow = sec < SLASH ? Math.max(0, Math.sin(sec * 7)) : 0;
  const tall = S.at(sec, SLASH, SLASH + 0.4);
  tomato(ctx, 'Roma Tom', 540, 1200 + bow * 15 - tall * 20, 520, { angle: 0.3 * bow, squash: 1 + bow * 0.08 });
  S.counter(ctx, COUNTER);
  if (sec >= SLASH + 0.3) S.reaction(ctx, theme, 'joy', 540, 1210, S.seg(sec, SLASH + 0.3, SLASH + 0.9));

  // The sorry bubbles, popping up one after another, fading out after the slash.
  const fade = 1 - S.at(sec, SLASH + 0.3, SLASH + 0.8);
  BUBBLES.forEach(([x, y, s0], i) => {
    const k = S.pop(sec, s0, 0.25);
    if (k <= 0 || fade <= 0) return;
    ctx.save(); ctx.globalAlpha *= fade;
    S.popIn(ctx, k, x, y + 40, () => {
      pen.shape(ctx, pen.roundRect(x - 120, y - 50, 240, 96, 40), { fill: C.card, width: 5, seed: 33110 + i, offset: 0 });
      text(ctx, props.sorry || '', x, y + 18, { size: 54, align: 'center', color: C.ink });
      if (sec >= SLASH) cross(ctx, x, y, 110, S.at(sec, SLASH + i * 0.03, SLASH + 0.25 + i * 0.03), theme.accent, 33130 + i * 2, 10);
    });
    ctx.restore();
  });

}

hook.cues = () => BUBBLES.map(([, , s]) => ({ sec: s, sfx: 'pop', gain: 0.35 })).concat([{ sec: SLASH, sfx: 'scratch', gain: 0.6 }, { sec: SLASH + 0.3, sfx: 'chime', gain: 0.4 }]);
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
