// This video's own hook.
//
// The idea: a "20% OFF" tag swings over the pastry counter and gets crossed out, while a tray
// of bite-size tastes slides in along the counter and Maria grabs one and lights up.
// Frame one shows: the discount tag already swinging on its string, Maria leaning toward the counter.
// Readable by 0.5 s: "Skip the *discount*. Offer a taste." under the CAFE OWNERS pill.
// The open loop: why would giving food away sell more than taking money off?
//
// props: { label, line, tag, tray, name }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, cross } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const CROSS = 0.85, TRAY = 0.7, BITE = 1.45, JOY = 1.55;
const TOP = 1300; // the counter's top edge

function bite(ctx, x, y, i, k) {
  if (k <= 0) return;
  const s = 1 + 0 * k;
  pen.line(ctx, [{ x: x + 4, y: y - 30 * s }, { x: x, y: y - 92 * s }], { width: 4, color: C.muted, seed: 17120 + i });
  pen.shape(ctx, pen.roundRect(x - 34, y - 46, 68, 46, 12), { fill: C.butter, width: 5, seed: 17130 + i, offset: 0 });
  pen.line(ctx, [{ x: x - 22, y: y - 30 }, { x: x + 20, y: y - 34 }], { width: 3, color: C.tomato, seed: 17140 + i });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.2;
  const name = props.name || 'Maria';

  kicker(ctx, props.label || '', W / 2 - 60, 250, { seed: 17101 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 320, size: 112, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 17102 });

  // Maria behind the counter on the right, leaning in, jumping when she gets her taste.
  const j = S.jump(sec, JOY, 50);
  const lean = -0.12 + 0.1 * S.at(sec, JOY, JOY + 0.3);
  const mx = 800, my = 1100 - j.hop;
  tomato(ctx, name, mx, my, 480, { squash: j.squash, angle: lean });

  // The discount tag on its string, swinging, then crossed out and fading back.
  const hx = 300, hy = 640;
  const swing = Math.sin(sec * 3.4 + 0.6) * 0.16 * (1 - 0.6 * S.at(sec, CROSS, CROSS + 0.6));
  ctx.save();
  ctx.translate(hx, hy); ctx.rotate(swing); ctx.translate(-hx, -hy);
  ctx.globalAlpha = 1 - 0.45 * S.at(sec, CROSS + 0.5, CROSS + 1);
  pen.line(ctx, [{ x: hx, y: hy }, { x: hx, y: hy + 130 }], { width: 4, color: theme.text, seed: 17103 });
  const tg = [{ x: hx, y: hy + 120 }, { x: hx + 140, y: hy + 200 }, { x: hx + 140, y: hy + 460 }, { x: hx - 140, y: hy + 460 }, { x: hx - 140, y: hy + 200 }];
  pen.shape(ctx, tg, { fill: C.card, width: 6, seed: 17104, offset: 0 });
  pen.shape(ctx, pen.ellipse(hx, hy + 185, 14, 14, 16), { fill: theme.bg, width: 4, seed: 17105, offset: 0 });
  const [pct, off] = String(props.tag || '20% OFF').split(' ');
  text(ctx, pct, hx, hy + 330, { size: 112, align: 'center', color: C.rose });
  text(ctx, off || '', hx, hy + 420, { size: 34, font: 'Inter', weight: 600, spacing: 6, align: 'center' });
  cross(ctx, hx, hy + 310, 250, S.at(sec, CROSS, CROSS + 0.35), C.ink, 17106, 12);
  ctx.restore();

  // The counter.
  pen.shape(ctx, [{ x: -40, y: TOP }, { x: 1120, y: TOP - 6 }, { x: 1120, y: 1980 }, { x: -40, y: 1980 }], { fill: C.card, width: 7, seed: 17107, offset: 0 });
  pen.line(ctx, [{ x: -40, y: TOP + 46 }, { x: 1120, y: TOP + 40 }], { width: 4, color: C.line, seed: 17108 });

  // The tasting tray sliding in from the left along the counter, with its little sign.
  const slide = 1 - S.at(sec, TRAY, TRAY + 0.45);
  const tx = 440 - slide * 800;
  pen.shape(ctx, pen.ellipse(tx, TOP - 6, 230, 34, 40), { fill: C.paper, width: 6, seed: 17109, offset: 0 });
  const taken = sec > BITE ? 1 : 0;
  [-150, -75, 0, 75, 150].forEach((dx, i) => {
    if (i === 4 && taken) return;
    bite(ctx, tx + dx, TOP - 14, i, 1);
  });
  // The bite lifted toward Maria.
  if (taken) {
    const p = S.at(sec, BITE, BITE + 0.25);
    const bx = tx + 150 + (mx - 150 - (tx + 150)) * p, by = TOP - 14 - 150 * p;
    bite(ctx, bx, by, 9, 1);
  }
  S.popIn(ctx, S.pop(sec, TRAY + 0.35, 0.3), tx - 60, TOP + 120, () => {
    pen.shape(ctx, pen.roundRect(tx - 220, TOP + 70, 330, 90, 18), { fill: C.lime, width: 5, seed: 17110, offset: 0 });
    text(ctx, props.tray || 'FREE TASTE', tx - 55, TOP + 128, { size: 34, font: 'Inter', weight: 600, spacing: 5, align: 'center' });
  });

  S.reaction(ctx, theme, 'joy', mx, my, S.seg(sec, JOY, JOY + 0.5));
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.4 },
  { sec: CROSS, sfx: 'scratch', gain: 0.55 },
  { sec: TRAY, sfx: 'whoosh', gain: 0.4 },
  { sec: BITE, sfx: 'pop', gain: 0.6 },
  { sec: JOY, sfx: 'chime', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
