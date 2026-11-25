// This video's own hook.
//
// The idea: a cash jar on the counter overflows with coins in December while confetti falls;
// then the calendar page flips to January, the confetti stops, and the jar drains down and down
// as bills fly out of it one after another, rent, payroll, taxes, leaving Roma Tom staring in.
// Frame one shows: coins already raining into the jar, confetti falling.
// Readable by 0.5 s: "Your best month can set up *your worst*."
// The open loop: why does that happen, and how do you get ready?
//
// props: { label, line, dec, jan, bills: [labels] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const FLIP = 1.6, J = { x: 560, y: 1420, w: 380, h: 480 };

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 35101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 100, maxW: 900, appear: S.at(sec, 0, 0.2), seed: 35102 });

  // The wall calendar page, flipping from December to January.
  const flip = S.at(sec, FLIP, FLIP + 0.35);
  const sy = Math.abs(Math.cos(flip * Math.PI));
  ctx.save(); ctx.translate(180, 1010); ctx.scale(1, Math.max(0.05, sy));
  pen.shape(ctx, pen.roundRect(-110, -90, 220, 180, 12), { fill: C.card, width: 6, seed: 35103, offset: 0 });
  pen.shape(ctx, pen.roundRect(-110, -90, 220, 50, 12), { fill: flip < 0.5 ? C.forest : C.sky, width: 6, seed: 35104 + (flip < 0.5 ? 0 : 1), offset: 0 });
  text(ctx, (flip < 0.5 ? props.dec : props.jan) || '', 0, 55, { size: 64, align: 'center' });
  ctx.restore();

  // December: confetti falling and coins pouring in. January: bills flying out.
  const dec = sec < FLIP;
  if (dec) for (let i = 0; i < 14; i++) {
    const ph = (sec * 0.7 + i * 0.13) % 1, x = 120 + ((i * 131) % 840), y = 600 + ph * 900;
    pen.shape(ctx, pen.roundRect(x, y, 18, 10, 2), { fill: [C.rose, C.lime, C.butter, C.sky][i % 4], width: 0, seed: 35110 + i, offset: 0 });
  }
  const level = dec ? 0.55 + 0.4 * S.at(sec, 0, FLIP) : 0.95 - 0.8 * S.at(sec, FLIP + 0.3, FLIP + 2.2);
  if (dec) for (let i = 0; i < 4; i++) {
    const p = S.seg(sec, i * 0.35, i * 0.35 + 0.6);
    if (p <= 0 || p >= 1) continue;
    const x0 = J.x - 260 + i * 150, x1 = J.x - 40 + i * 25, y0 = 760, y1 = J.y - J.h * level;
    const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p - Math.sin(Math.PI * p) * 80, sq = Math.abs(Math.cos(p * 12));
    pen.shape(ctx, pen.ellipse(x, y, 34 * sq + 6, 34, 24), { fill: C.lime, width: 4, seed: 35130 + i, offset: 0 });
  }

  // The jar and its coins.
  const top = J.y - J.h * level;
  pen.fill(ctx, [{ x: J.x - J.w / 2 + 14, y: top }, { x: J.x + J.w / 2 - 14, y: top }, { x: J.x + J.w / 2 - 14, y: J.y - 10 }, { x: J.x - J.w / 2 + 14, y: J.y - 10 }], C.lime, { seed: 35140 });
  for (let yy = top + 20; yy < J.y - 20; yy += 34) pen.line(ctx, [{ x: J.x - J.w / 2 + 30, y: yy }, { x: J.x + J.w / 2 - 30, y: yy + 2 }], { width: 3, color: C.muted, seed: 35141 + Math.floor(yy) });
  pen.line(ctx, pen.roundRect(J.x - J.w / 2, J.y - J.h, J.w, J.h, 40), { width: 7, seed: 35150, closed: true });
  pen.shape(ctx, pen.roundRect(J.x - J.w / 2 - 10, J.y - J.h - 30, J.w + 20, 40, 10), { fill: C.card, width: 6, seed: 35151, offset: 0 });

  // January bills flying up and out of the jar.
  (props.bills || []).forEach((b, i) => {
    const s0 = FLIP + 0.4 + i * 0.5, p = S.at(sec, s0, s0 + 0.7);
    if (p <= 0) return;
    const x = J.x + (i - 1) * 290 * p, y = J.y - J.h - 40 - p * 150 + Math.abs(i - 1) * 30 * p;
    ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.3 * p);
    pen.shape(ctx, pen.roundRect(-130, -55, 260, 110, 12), { fill: C.card, width: 6, seed: 35160 + i, offset: 0 });
    text(ctx, b, 0, 20, { size: 58, align: 'center', color: theme.accent });
    ctx.restore();
  });

  // Roma Tom next to the jar: happy in December, then sweating in January.
  tomato(ctx, 'Roma Tom', 170, 1350, 340, { squash: S.breathe(sec), angle: dec ? Math.sin(sec * 6) * 0.06 : -0.1, mouth: !dec && sec > FLIP + 1.2 ? 0.8 : undefined });
  if (dec) S.reaction(ctx, theme, 'joy', 200, 1260, S.seg(sec, 0.2, 0.8));
  else S.reaction(ctx, theme, 'sweat', 160, 1250, S.seg(sec, FLIP + 0.6, FLIP + 1.2));
  pen.line(ctx, [{ x: -40, y: J.y }, { x: 1120, y: J.y - 4 }], { width: 7, seed: 35170 });
}

hook.cues = () => [
  { sec: 0.6, sfx: 'clink', gain: 0.4 }, { sec: 0.95, sfx: 'clink', gain: 0.4 }, { sec: 1.3, sfx: 'clink', gain: 0.4 },
  { sec: FLIP, sfx: 'rustle', gain: 0.5 }, { sec: FLIP + 0.4, sfx: 'whoosh', gain: 0.35 }, { sec: FLIP + 0.95, sfx: 'whoosh', gain: 0.35 }, { sec: FLIP + 1.5, sfx: 'whoosh', gain: 0.35 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
