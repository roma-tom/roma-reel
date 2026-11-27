// This video's own hook.
//
// The idea: an old-fashioned balance scale. On one pan sits the month's power bill, heavy, with a
// lightning bolt on it; on the other, croissants drop in one after another, faster and faster,
// piling up, while the beam creeps toward level and a big question mark hangs over it.
// Frame one shows: the first croissant already dropping onto the pan.
// Readable by 0.5 s: "How many croissants pay *the power bill*?"
// The open loop: the number (answered at the end).
//
// props: { label, line, mark }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const P = { x: W / 2, y: 960 }, ARM = 300, RUN = 3.2;

function croissant(ctx, x, y, a, seed) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  const pts = [];
  for (let i = 0; i <= 16; i++) { const t = Math.PI * i / 16; pts.push({ x: -62 * Math.cos(t), y: -48 * Math.sin(t) }); }
  for (let i = 16; i >= 0; i--) { const t = Math.PI * i / 16; pts.push({ x: -30 * Math.cos(t), y: -8 * Math.sin(t) }); }
  pen.shape(ctx, pts, { fill: C.butter, width: 5, seed, offset: 0 });
  [-26, 0, 26].forEach((dx, i) => pen.line(ctx, [{ x: dx * 1.1, y: -40 + Math.abs(dx) * 0.4 }, { x: dx * 0.8, y: -10 }], { width: 4, color: C.muted, seed: seed + 1 + i }));
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 43101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 43102 });

  // How many croissants have landed: slow at first, then a flood.
  const f = Math.min(1, (sec + 0.2) / RUN);
  const n = Math.floor(18 * f * f) + 1;
  // The beam tilts down on the bill side (left), easing toward level as croissants pile on.
  const tilt = 0.32 * (1 - Math.min(1, n / 22)) + Math.sin(sec * 6) * 0.01;
  const lx = P.x - Math.cos(tilt) * ARM, ly = P.y + Math.sin(tilt) * ARM;
  const rx = P.x + Math.cos(tilt) * ARM, ry = P.y - Math.sin(tilt) * ARM;
  pen.shape(ctx, [{ x: P.x - 60, y: 1460 }, { x: P.x + 60, y: 1460 }, { x: P.x + 16, y: P.y }, { x: P.x - 16, y: P.y }], { fill: C.ink, width: 5, seed: 43103, offset: 0 });
  pen.line(ctx, [{ x: lx, y: ly }, { x: rx, y: ry }], { width: 14, seed: 43104 });
  // Pans hang from each end.
  const pan = (x, y, seed) => {
    pen.line(ctx, [{ x, y }, { x: x - 120, y: y + 200 }], { width: 4, seed });
    pen.line(ctx, [{ x, y }, { x: x + 120, y: y + 200 }], { width: 4, seed: seed + 1 });
    pen.shape(ctx, [{ x: x - 150, y: y + 200 }, { x: x + 150, y: y + 200 }, { x: x + 110, y: y + 240 }, { x: x - 110, y: y + 240 }], { fill: C.card, width: 6, seed: seed + 2, offset: 0 });
  };
  pan(lx, ly, 43110); pan(rx, ry, 43120);
  // The power bill on the left pan, with a lightning bolt.
  pen.shape(ctx, pen.roundRect(lx - 100, ly + 40, 200, 160, 10), { fill: C.card, width: 5, seed: 43130, offset: 0 });
  pen.shape(ctx, [{ x: lx + 10, y: ly + 60 }, { x: lx - 30, y: ly + 125 }, { x: lx, y: ly + 125 }, { x: lx - 15, y: ly + 185 }, { x: lx + 35, y: ly + 110 }, { x: lx + 5, y: ly + 110 }], { fill: C.butter, width: 4, seed: 43131, offset: 0 });
  // Croissants piled on the right pan, the newest one still falling.
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    const tx = rx - 100 + col * 66 + (row % 2) * 33, ty = ry + 196 - row * 34;
    const last = i === n - 1, drop = last ? 1 - ((sec * (2 + 8 * f)) % 1) : 0;
    croissant(ctx, tx, ty - drop * 200, ((i * 37) % 7 - 3) * 0.08, 43140 + i * 4);
  }
  // The question mark over it all.
  text(ctx, props.mark || '', P.x, P.y - 60, { size: 150, align: 'center', color: theme.accent });

  // Roma Tom watching, counting under his breath.
  tomato(ctx, 'Roma Tom', 200, 1360, 280, { squash: S.breathe(sec), angle: Math.sin(sec * 7) * 0.05 });
  S.reaction(ctx, theme, 'think', 200, 1320, S.seg(sec, 0.5, 1.1));
  pen.line(ctx, [{ x: -40, y: 1460 }, { x: 1120, y: 1456 }], { width: 7, seed: 43150 });
}

hook.cues = () => {
  const c = [];
  for (let i = 0; i < 10; i++) c.push({ sec: RUN * Math.sqrt(i / 10), sfx: 'tap', gain: 0.35 });
  return c;
};
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
