// This video's own hook.
//
// The idea: two candidates walk in for the same job: Leo, wobbling under a tall stack of
// resume pages topped with "12 YEARS", and Jess with nothing but a wave and "Hi! I'm Jess."
// Pages slide off Leo's stack as Jess lights up.
// Frame one shows: Leo already mid-walk, the stack teetering over his head.
// Readable by 0.5 s: "HIRING" / "Lots of experience. *Good hire?*"
// The open loop: which one would you hire, and why isn't the answer obvious?
//
// props: { label, line, years, hi, left, right }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1500;
const HI = 1.0, SLIP = 1.35, SWEAT = 1.6;

function page(ctx, x, y, w, h, seed, fill = C.card) {
  pen.shape(ctx, pen.roundRect(x - w / 2, y - h / 2, w, h, 8), { fill, width: 5, seed, offset: 0 });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.4;
  const left = props.left || 'Leo', right = props.right || 'Jess';

  kicker(ctx, props.label || '', W / 2 - 60, 250, { seed: 18101 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 320, size: 112, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 18102 });

  // The floor.
  pen.line(ctx, [{ x: -20, y: FLOOR }, { x: 1100, y: FLOOR - 8 }], { width: 6, color: theme.text, seed: 18103 });

  // Leo walks in from the left with his stack.
  const lw = S.walk(sec, 120, 290, 0, 0.7, 1320);
  const sweat = S.seg(sec, SWEAT, SWEAT + 0.4);
  tomato(ctx, left, lw.x, lw.y, 620, { angle: lw.angle, squash: S.breathe(sec) });

  // The stack, teetering on his head: pivot at its base.
  const base = lw.y - 150;
  const tilt = Math.sin(sec * 5.2) * 0.05 + 0.06 * S.at(sec, SLIP - 0.2, SLIP);
  ctx.save();
  ctx.translate(lw.x, base); ctx.rotate(tilt); ctx.translate(-lw.x, -base);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const jx = Math.sin(i * 2.3) * 14;
    page(ctx, lw.x + jx, base - 22 - i * 34, 230, 34, 18110 + i);
  }
  const ty = base - 22 - n * 34 - 40;
  page(ctx, lw.x, ty, 270, 92, 18130, C.butter);
  text(ctx, props.years || '', lw.x, ty + 14, { size: 40, font: 'Inter', weight: 600, spacing: 5, align: 'center' });
  ctx.restore();

  // Two pages slipping off the stack and fluttering down.
  [0, 1].forEach((i) => {
    const p = S.seg(sec, SLIP + i * 0.12, SLIP + i * 0.12 + 0.9);
    if (p <= 0 || p >= 1) return;
    const dir = i ? -1 : 1;
    const x = lw.x + dir * (40 + 170 * p) + Math.sin(p * 9) * 20;
    const y = base - 200 + 380 * p;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(dir * (0.3 + Math.sin(p * 7) * 0.4)); ctx.translate(-x, -y);
    page(ctx, x, y, 200, 30, 18140 + i);
    ctx.restore();
  });
  S.reaction(ctx, theme, 'sweat', lw.x, lw.y, sweat);

  // Jess walks in from the right, waves, and says hi.
  const rw = S.walk(sec, 1180, 790, 0.15, 0.85, 1320);
  const j = S.jump(sec, HI, 40);
  tomato(ctx, right, rw.x, rw.y - j.hop, 620, { angle: rw.angle, squash: j.squash });
  S.say(ctx, props.hi || '', { x: 560, y: 720, w: 440, tx: rw.x - 30, ty: 1120, k: S.pop(sec, HI, 0.35), size: 84, seed: 18150 });
  S.reaction(ctx, theme, 'joy', rw.x, rw.y - j.hop, S.seg(sec, HI + 0.1, HI + 0.6));
}

hook.cues = () => [
  { sec: 0, sfx: 'rustle', gain: 0.5 },
  { sec: 0.2, sfx: 'tap', gain: 0.35 },
  { sec: HI, sfx: 'pop', gain: 0.6 },
  { sec: SLIP, sfx: 'swish', gain: 0.45 },
  { sec: SWEAT, sfx: 'boing', gain: 0.35 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
