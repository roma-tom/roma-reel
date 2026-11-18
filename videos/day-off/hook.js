// This video's own hook.
//
// The idea: Roma Tom finally on a day off, lying back on a lounge chair in sunglasses under the
// sun, while the phone on the little table beside him buzzes and its missed-call badge counts
// up, faster and faster, to eleven. He peeks over his sunglasses.
// Frame one shows: the phone already buzzing, the badge already at 1.
// Readable by 0.5 s: "Day off. *11 missed calls.*"
// The open loop: who's calling, and does he pick up?
//
// props: { label, line, calls }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const RUN = 2.6, PEEK = 2.8, GROUND = 1440;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;

  // The sun, slowly turning.
  const sx = 880, sy = 780;
  pen.shape(ctx, pen.ellipse(sx, sy, 64, 64, 28), { fill: C.card, width: 5, seed: 26101, offset: 0 });
  for (let i = 0; i < 8; i++) {
    const a = sec * 0.6 + (i * Math.PI) / 4;
    pen.line(ctx, [{ x: sx + Math.cos(a) * 86, y: sy + Math.sin(a) * 86 }, { x: sx + Math.cos(a) * 116, y: sy + Math.sin(a) * 116 }], { width: 7, color: C.card, seed: 26110 + i });
  }
  kicker(ctx, props.label || '', W / 2, 260, { seed: 26102 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 26103 });

  // The lounge chair, Roma Tom lying back on it with sunglasses.
  pen.shape(ctx, [{ x: 160, y: 1250 }, { x: 760, y: 1300 }, { x: 760, y: 1340 }, { x: 160, y: 1290 }], { fill: C.card, width: 6, seed: 26120, offset: 0 });
  pen.line(ctx, [{ x: 200, y: 1290 }, { x: 180, y: GROUND }], { width: 7, seed: 26121 });
  pen.line(ctx, [{ x: 720, y: 1335 }, { x: 740, y: GROUND }], { width: 7, seed: 26122 });
  const peek = S.at(sec, PEEK, PEEK + 0.3);
  const rx = 420, ry = 1150 - peek * 40;
  const size = 420, angle = -0.35 + peek * 0.25;
  tomato(ctx, 'Roma Tom', rx, ry, size, { angle, squash: S.breathe(sec * 0.5) });
  // Sunglasses, drawn in the tomato's own frame (same pivot and tilt as tomato() uses) so they
  // sit on its eyes and tilt with its head; they slip down the face when he peeks over them.
  const bottom = (441 / 512) * size;
  ctx.save();
  ctx.translate(rx, ry - size / 2 + bottom);
  ctx.rotate(angle);
  const gy = -0.34 * size + peek * 0.09 * size, gap = 0.1 * size;
  [-1, 1].forEach((d, i) => pen.shape(ctx, pen.ellipse(d * gap, gy, 0.085 * size, 0.06 * size, 18), { fill: C.ink, width: 4, seed: 26130 + i, offset: 0 }));
  pen.line(ctx, [{ x: -gap + 0.07 * size, y: gy - 4 }, { x: gap - 0.07 * size, y: gy - 4 }], { width: 6, seed: 26132 });
  ctx.restore();
  pen.line(ctx, [{ x: -40, y: GROUND }, { x: 1120, y: GROUND - 4 }], { width: 7, seed: 26133 });

  // The side table and the phone, buzzing, its badge counting up faster and faster.
  pen.shape(ctx, pen.roundRect(790, 1220, 200, 30, 8), { fill: C.card, width: 5, seed: 26140, offset: 0 });
  pen.line(ctx, [{ x: 890, y: 1250 }, { x: 890, y: GROUND }], { width: 7, seed: 26141 });
  const total = Number(props.calls) || 11;
  const f = Math.min(1, (sec + 0.1) / RUN);
  const n = Math.max(1, Math.min(total, Math.ceil(total * f * f)));
  const buzz = sec < RUN + 0.3 ? Math.sin(sec * 80) * 5 : 0;
  ctx.save(); ctx.translate(890, 1215); ctx.scale(1.6, 1.6); ctx.translate(-890, -1215);
  pen.shape(ctx, pen.roundRect(830 + buzz, 1150, 120, 70, 14), { fill: C.ink, width: 5, seed: 26142, offset: 0 });
  pen.fill(ctx, pen.roundRect(840 + buzz, 1158, 100, 54, 10), C.sky, { seed: 26143 });
  pen.shape(ctx, pen.ellipse(948 + buzz, 1146, 40, 40, 20), { fill: C.rose, width: 4, seed: 26144, offset: 0 });
  text(ctx, String(n), 948 + buzz, 1163, { size: 48, align: 'center', color: C.card });
  if (sec < RUN + 0.3) [-1, 1].forEach((d, i) => pen.line(ctx, [{ x: 890 + d * 90, y: 1150 }, { x: 890 + d * 110, y: 1180 }, { x: 890 + d * 90, y: 1210 }], { width: 6, color: theme.text, seed: 26150 + i }));
  ctx.restore();
  if (sec > PEEK) S.reaction(ctx, theme, 'sweat', rx + 20, ry - 20, S.seg(sec, PEEK, PEEK + 0.6));
}

hook.cues = () => {
  const c = [];
  for (let i = 0; i < 11; i++) c.push({ sec: RUN * Math.sqrt(i / 11), sfx: 'blip', gain: 0.35 });
  return c.concat([{ sec: PEEK, sfx: 'boing', gain: 0.4 }]);
};
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
