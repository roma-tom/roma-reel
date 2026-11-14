// This video's own hook.
//
// The idea: two candidates side by side. Above Theo a résumé stack piles higher and higher;
// above Ana sits one lonely page. Then Ana lights up and waves at a guest walking past while
// Theo yawns.
// Frame one shows: Theo's stack already climbing, page after page.
// Readable by 0.5 s: "More experience, *better hire*?"
// The open loop: if not experience, what makes a good hire?
//
// props: { label, line, left, right }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1500, WAVE = 2.3, LX = 290, RX = 790;

function page(ctx, x, y, seed, a = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  pen.shape(ctx, pen.roundRect(-90, -16, 180, 32, 6), { fill: C.card, width: 4, seed, offset: 0 });
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 19101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 19102 });

  // Theo's stack of résumé pages, piling up.
  const n = Math.min(14, 2 + Math.floor(sec * 6));
  for (let i = 0; i < n; i++) page(ctx, LX + ((i * 7) % 11) - 5, 1050 - i * 30, 19110 + i, ((i * 13) % 7 - 3) * 0.01);
  S.popIn(ctx, S.pop(sec, 0.05, 0.3), LX, 1110, () => kicker(ctx, props.left || '', LX, 1110, { seed: 19103 }));

  // Ana's single page.
  page(ctx, RX, 1050, 19130);
  S.popIn(ctx, S.pop(sec, 0.15, 0.3), RX, 1110, () => kicker(ctx, props.right || '', RX, 1110, { seed: 19104 }));

  // The two candidates. After a beat, a guest wanders past: Ana waves and lights up, Theo yawns.
  const waved = sec > WAVE;
  tomato(ctx, 'Theo', LX, 1360, 380, { squash: S.breathe(sec), angle: waved ? -0.12 : 0.02, mouth: waved ? 0.9 : undefined });
  const j = S.jump(sec, WAVE, 50);
  tomato(ctx, 'Ana', RX - 40, 1360 - j.hop, 380, { squash: j.squash, angle: waved ? 0.12 + Math.sin(sec * 12) * 0.06 : -0.02 });
  if (waved) {
    S.reaction(ctx, theme, 'joy', RX - 40, 1300, S.seg(sec, WAVE, WAVE + 0.6));
    S.reaction(ctx, theme, 'think', LX - 200, 1420, S.seg(sec, WAVE + 0.2, WAVE + 0.8));
  }
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 19105 });
  // The guest strolling in along the floor from the right.
  if (sec > WAVE - 0.6) {
    const w = S.walk(sec, 1240, 1020, WAVE - 0.6, WAVE + 0.4, FLOOR - 10);
    tomato(ctx, 'Maria', w.x, w.y - 110, 260, { angle: w.angle });
  }
}

hook.cues = () => [
  ...[0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((sec) => ({ sec, sfx: 'rustle', gain: 0.25 })),
  { sec: WAVE, sfx: 'chime', gain: 0.45 }, { sec: WAVE + 0.2, sfx: 'boing', gain: 0.3 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
