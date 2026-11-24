// This video's own hook.
//
// The idea: 6:02 am, the phone lights up with a text; on the wall behind, the day's schedule has
// Ana's shift on it, and her name tile peels off and flutters to the floor, leaving a gap. Roma
// Tom, coffee in hand, freezes mid-sip.
// Frame one shows: the phone already buzzing on the counter.
// Readable by 0.5 s: "6:02 am. *Ana's sick.*"
// The open loop: who covers the shift?
//
// props: { label, line, time, names: [schedule names, the second one falls] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const PEEL = 1.0, COUNTER = 1420;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 39101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 39102 });

  // The schedule board on the wall, with three name tiles; the middle one peels off and falls.
  const B = { x: 400, y: 580, w: 600, h: 500 };
  pen.shape(ctx, pen.roundRect(B.x, B.y, B.w, B.h, 14), { fill: C.card, width: 6, seed: 39103, offset: 0 });
  text(ctx, props.time || '', B.x + B.w / 2, B.y + 70, { size: 56, align: 'center' });
  (props.names || []).forEach((name, i) => {
    const y0 = B.y + 140 + i * 110;
    let x = B.x + 40, y = y0, a = 0;
    if (i === 1) {
      const f = S.at(sec, PEEL, PEEL + 0.9, (v) => v * v);
      a = f * 1.2 + Math.sin(sec * 8) * 0.2 * f; y = y0 + f * 540; x = B.x + 40 - f * 120;
      // The gap it leaves behind.
      if (f > 0) pen.line(ctx, pen.roundRect(B.x + 40, y0, B.w - 80, 84, 10), { width: 4, color: theme.accent, seed: 39110, closed: true });
    }
    ctx.save(); ctx.translate(x + (B.w - 80) / 2, y + 42); ctx.rotate(a);
    pen.shape(ctx, pen.roundRect(-(B.w - 80) / 2, -42, B.w - 80, 84, 10), { fill: i === 1 ? C.butter : C.sky, width: 4, seed: 39111 + i, offset: 0 });
    text(ctx, name, 0, 22, { size: 62, align: 'center' });
    ctx.restore();
  });

  // Roma Tom with his coffee, freezing mid-sip when the tile falls.
  const frozen = sec > PEEL;
  tomato(ctx, 'Roma Tom', 210, 1230, 480, { squash: S.breathe(sec), angle: frozen ? 0 : -0.06 + Math.sin(sec * 3) * 0.03, mouth: frozen ? 0.8 : undefined });
  S.cup(ctx, 380, COUNTER, 1.1);
  if (frozen) S.reaction(ctx, theme, 'shock', 210, 1170, S.seg(sec, PEEL, PEEL + 0.4));
  S.counter(ctx, COUNTER);
  // The phone buzzing on the counter.
  const buzz = sec < PEEL ? Math.sin(sec * 80) * 6 : 0;
  ctx.save(); ctx.translate(630, COUNTER); ctx.scale(1.6, 1.6); ctx.translate(-630, -COUNTER);
  pen.shape(ctx, pen.roundRect(560 + buzz, COUNTER - 30, 140, 40, 10), { fill: C.ink, width: 4, seed: 39120, offset: 0 });
  pen.fill(ctx, pen.roundRect(568 + buzz, COUNTER - 24, 124, 28, 6), C.card, { seed: 39121 });
  if (sec < PEEL) [-1, 1].forEach((d, i) => pen.line(ctx, [{ x: 630 + d * 100, y: COUNTER - 40 }, { x: 630 + d * 120, y: COUNTER - 10 }], { width: 6, color: theme.text, seed: 39122 + i }));
  ctx.restore();
}

hook.cues = () => [{ sec: 0, sfx: 'blip', gain: 0.45 }, { sec: 0.4, sfx: 'blip', gain: 0.45 }, { sec: PEEL, sfx: 'rustle', gain: 0.5 }, { sec: PEEL + 0.9, sfx: 'tap', gain: 0.4 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
