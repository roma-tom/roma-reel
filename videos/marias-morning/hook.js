// This video's own hook.
//
// The idea: 7:15, same as every day. Maria walks in through the door, heads straight to "her"
// table by the window, and as she sits down an oat latte slides across to her by itself, already
// made, a little heart floating up from the foam.
// Frame one shows: Maria mid-step through the door, the wall clock at 7:15.
// Readable by 0.5 s: "7:15. *Same table. Same latte.*"
// The open loop: what's the rest of her morning like?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1520, SIT = 1.4, SLIDE = 1.7;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 31101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 31102 });

  // The window with morning light, and the wall clock at 7:15.
  pen.shape(ctx, pen.roundRect(560, 620, 420, 360, 14), { fill: C.card, width: 7, seed: 31103, offset: 0 });
  pen.line(ctx, [{ x: 770, y: 620 }, { x: 772, y: 980 }], { width: 6, seed: 31104 });
  pen.line(ctx, [{ x: 560, y: 800 }, { x: 980, y: 798 }], { width: 6, seed: 31105 });
  S.clock(ctx, theme, 200, 720, 90, 7, 15 + sec * 0.3, 1, 31106);

  // Maria walks in from the left and settles at her table.
  const w = S.walk(sec, -150, 700, 0, SIT, FLOOR - 20);
  const sitting = sec >= SIT;
  // Her table by the window: she walks in front of it, then sits behind it.
  const maria = () => tomato(ctx, 'Maria', w.x, (sitting ? 1040 : w.y - 240), 460, { angle: sitting ? Math.sin(sec * 1.5) * 0.03 : w.angle, squash: S.breathe(sec) });
  if (sitting) maria();
  S.table(ctx, 770, 1260, { w: 420, seed: 31110 });
  if (!sitting) maria();
  if (sec > SLIDE + 0.5) S.reaction(ctx, theme, 'joy', w.x, 1010, S.seg(sec, SLIDE + 0.5, SLIDE + 1.1));

  // The oat latte slides in across the table, already made, with a heart floating up.
  const p = S.at(sec, SLIDE, SLIDE + 0.5);
  if (p > 0) {
    const cx = 1120 - p * 260;
    S.cup(ctx, cx, 1236, 1.0);
    if (p >= 1) {
      const h = S.at(sec, SLIDE + 0.5, SLIDE + 1.5), hy = 1110 - h * 120;
      pen.shape(ctx, [{ x: cx, y: hy + 20 }, { x: cx - 26, y: hy }, { x: cx - 14, y: hy - 16 }, { x: cx, y: hy - 6 }, { x: cx + 14, y: hy - 16 }, { x: cx + 26, y: hy }], { fill: C.rose, width: 4, seed: 31120, offset: 0, alpha: 1 - h * 0.6 });
    }
  }
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 31121 });
}

hook.cues = () => [
  { sec: 0, sfx: 'tap', gain: 0.3 }, { sec: 0.5, sfx: 'tap', gain: 0.3 }, { sec: 1.0, sfx: 'tap', gain: 0.3 },
  { sec: SLIDE, sfx: 'swish', gain: 0.4 }, { sec: SLIDE + 0.5, sfx: 'clink', gain: 0.45 }, { sec: SLIDE + 0.6, sfx: 'chime', gain: 0.4 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
