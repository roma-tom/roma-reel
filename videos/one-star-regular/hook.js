// This video's own hook.
//
// The idea: Ivan sits at a table with a latte so cold it's shivering (ice cubes bobbing in it,
// no steam), and holds up his phone: one star stamps in, rose, while the other four stay empty
// and the phone buzzes.
// Frame one shows: the cup already shivering, Ivan already holding the phone up, the stars
// waiting to be filled.
// Readable by 0.5 s: "My latte was *cold.*" (the ONE STAR pill above it).
// The open loop: a one-star review from a guest. What does the owner do with it?
//
// props: { label, line, name, stars }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, star } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const STAMP = 1.0, BUZZ = 1.5, TABLE = 1400;
const P = { x: 540, y: 600, w: 390, h: 640 };

function iceCube(ctx, x, y, s, seed) {
  pen.shape(ctx, pen.roundRect(x - s / 2, y - s / 2, s, s, 8), { fill: C.sky, width: 4, seed, offset: 0 });
  pen.line(ctx, [{ x: x - s / 4, y: y - s / 5 }, { x: x - s / 10, y: y - s / 3 }], { width: 3, color: C.card, seed: seed + 1 });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.2;
  const name = props.name || 'Ivan';
  const filled = props.stars ?? 1;

  kicker(ctx, props.label || '', W / 2 - 60, 260, { seed: 15101 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 330, size: 124, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 15102 });

  // The table, and Ivan behind it on the left.
  const j = S.jump(sec, STAMP, 26);
  tomato(ctx, name, 230, TABLE - 200 - j.hop, 430, { squash: j.squash, angle: -0.05 + Math.sin(sec * 2) * 0.02 });
  pen.shape(ctx, pen.roundRect(-40, TABLE, 760, 40, 14), { fill: C.card, width: 6, seed: 15103, offset: 0 });
  pen.line(ctx, [{ x: 120, y: TABLE + 40 }, { x: 130, y: TABLE + 260 }], { width: 7, seed: 15104 });
  pen.line(ctx, [{ x: 560, y: TABLE + 40 }, { x: 550, y: TABLE + 260 }], { width: 7, seed: 15105 });

  // The cold latte: no steam, shivering, two ice cubes bobbing over the rim.
  const shiver = Math.sin(sec * 48) * 5;
  const cx = 430 + shiver, cy = TABLE;
  pen.shape(ctx, pen.ellipse(cx, cy + 4, 104, 20), { fill: C.card, width: 5, seed: 15106, offset: 0 });
  pen.shape(ctx, [{ x: cx - 70, y: cy - 140 }, { x: cx + 70, y: cy - 140 }, { x: cx + 50, y: cy - 2 }, { x: cx - 50, y: cy - 2 }], { fill: C.card, width: 5, seed: 15107, offset: 0 });
  iceCube(ctx, cx - 22, cy - 152 + Math.sin(sec * 5) * 7, 50, 15108);
  iceCube(ctx, cx + 28, cy - 160 + Math.sin(sec * 5 + 2) * 7, 42, 15110);
  [-1, 1].forEach((side, i) => [0, 1].forEach((k) => {
    const x = cx + side * (96 + k * 28), y = cy - 90 + k * 24;
    pen.line(ctx, [{ x, y: y - 18 }, { x: x + side * 8, y }, { x, y: y + 18 }], { width: 4, color: theme.text, seed: 15120 + i * 2 + k, alpha: 0.5 + 0.5 * Math.abs(Math.sin(sec * 9 + k)) });
  }));

  // The phone in his hand, held up, buzzing once the star lands.
  const buzz = sec > BUZZ && sec < BUZZ + 0.5 ? Math.sin(sec * 80) * 7 : 0;
  const lift = (1 - S.at(sec, 0, 0.35)) * 120;
  ctx.save(); ctx.translate(buzz, lift); ctx.rotate(0.05);
  pen.shape(ctx, pen.roundRect(P.x, P.y, P.w, P.h, 44), { fill: C.ink, width: 6, seed: 15130, offset: 0 });
  pen.fill(ctx, pen.roundRect(P.x + 16, P.y + 16, P.w - 32, P.h - 32, 32), C.card, { seed: 15131 });
  pen.fill(ctx, pen.roundRect(P.x + P.w / 2 - 50, P.y + 28, 100, 22, 11), C.ink, { seed: 15132, amp: 0.5 });
  tomato(ctx, name, P.x + P.w / 2, P.y + 180, 150, { squash: S.breathe(sec) });
  text(ctx, name, P.x + P.w / 2, P.y + 310, { size: 60, align: 'center' });
  for (let i = 0; i < 5; i++) {
    const sx = P.x + 67 + i * 64, sy = P.y + 400;
    if (i < filled) {
      const k = S.pop(sec, STAMP + i * 0.1, 0.3);
      star(ctx, sx, sy, 28, C.card, 15140 + i, 4);
      if (k > 0) S.popIn(ctx, k * (1 + 0.6 * (1 - S.seg(sec, STAMP, STAMP + 0.6))), sx, sy, () => star(ctx, sx, sy, 34, C.rose, 15150 + i, 5));
    } else {
      star(ctx, sx, sy + (sec > STAMP ? Math.sin(sec * 30 + i) * 2 : 0), 28, C.card, 15140 + i, 4);
    }
  }
  [0, 1, 2].forEach((r) => pen.line(ctx, [{ x: P.x + 50, y: P.y + 480 + r * 38 }, { x: P.x + P.w - 50 - r * 40, y: P.y + 480 + r * 38 }], { width: 6, color: C.line, seed: 15160 + r }));
  ctx.restore();

  S.reaction(ctx, theme, 'think', 200, TABLE - 200 - j.hop, S.seg(sec, STAMP + 0.4, STAMP + 1));
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.4 },
  { sec: 0.3, sfx: 'tick', gain: 0.3 },
  { sec: STAMP, sfx: 'pop', gain: 0.7 },
  { sec: BUZZ, sfx: 'blip', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
