// This video's own hook.
//
// The idea: Ivan sips a latte with icicles hanging off the cup and shivers, then his phone pops
// up and taps out a review: one star filled, four left empty, landing with a thud.
// Frame one shows: Ivan mid-shiver, frost flakes already drifting off the cup.
// Readable by 0.5 s: "One star. *Cold latte.*"
// The open loop: how does a one-star guest end up a regular?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { star, phone } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const PHONE = 0.9, STARS = 1.3, COUNTER = 1420;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 18101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 18102 });

  // Ivan, shivering.
  const shiver = Math.sin(sec * 45) * 6 * (1 - S.seg(sec, 1.6, 2.4));
  tomato(ctx, 'Ivan', 220 + shiver, 1240, 460, { squash: S.breathe(sec), angle: -0.05 });
  S.reaction(ctx, theme, 'sweat', 200, 1190, S.seg(sec, 0.1, 0.6));
  S.counter(ctx, COUNTER);

  // The frozen latte: icicles under the rim and frost flakes drifting up.
  const cx = 470, cy = COUNTER;
  S.cup(ctx, cx, cy, 1.6);
  [-54, -18, 18, 54].forEach((dx, i) => pen.shape(ctx, [{ x: cx + dx - 12, y: cy - 118 }, { x: cx + dx + 12, y: cy - 118 }, { x: cx + dx, y: cy - 118 + 34 + (i % 2) * 18 }], { fill: C.sky, width: 3, seed: 18110 + i, offset: 0 }));
  for (let i = 0; i < 5; i++) {
    const ph = (sec * 0.6 + i / 5) % 1;
    pen.sparkle(ctx, cx - 50 + ((i * 37) % 110), cy - 170 - ph * 220, 14 * (1 - ph) + 4, { fill: C.card, seed: 18120 + i });
  }

  // The phone pops up and the review lands: one star filled, four empty.
  const k = S.pop(sec, PHONE, 0.35);
  const thud = sec > STARS + 0.9 && sec < STARS + 1.3 ? Math.sin(sec * 70) * 5 : 0;
  S.popIn(ctx, k, 740, 1120, () => {
    ctx.save(); ctx.translate(thud, 0);
    const scr = phone(ctx, 600, 600, 300, 520, 18130);
    for (let i = 0; i < 5; i++) {
      const sk = S.pop(sec, STARS + i * 0.15, 0.25);
      const x = scr.x + 34 + i * 48, y = scr.y + 180;
      star(ctx, x, y, 24 * sk, i === 0 ? C.tomato : C.card, 18140 + i, 4);
    }
    [0, 1].forEach((r) => pen.line(ctx, [{ x: scr.x + 30, y: scr.y + 360 + r * 40 }, { x: scr.x + scr.w - 40 - r * 60, y: scr.y + 360 + r * 40 }], { width: 6, color: C.muted, seed: 18150 + r }));
    ctx.restore();
  });
}

hook.cues = () => [
  { sec: 0, sfx: 'rustle', gain: 0.3 }, { sec: PHONE, sfx: 'blip', gain: 0.45 },
  ...[0, 1, 2, 3, 4].map((i) => ({ sec: STARS + i * 0.15, sfx: 'tap', gain: 0.35 })),
  { sec: STARS + 0.9, sfx: 'squish', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
