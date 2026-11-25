// This video's own hook.
//
// The idea: Maria and Priya at a table trying to talk; Maria's speech bubble fills with words but
// the music notes blasting from the speaker on the wall swarm over it and the words scramble into
// squiggles. Priya cups her ear. Then a hand-drawn volume knob turns down and the words come back.
// Frame one shows: notes already pouring out of the speaker.
// Readable by 0.5 s: "Can they hear *each other*?"
// The open loop: how loud is too loud?
//
// props: { label, line, words }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, bubble } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const DOWN = 2.3, FLOOR = 1500;

function note(ctx, x, y, s, seed, alpha) {
  pen.fill(ctx, pen.ellipse(x, y, 16 * s, 12 * s, 12), C.ink, { seed, alpha });
  pen.line(ctx, [{ x: x + 14 * s, y }, { x: x + 14 * s, y: y - 50 * s }, { x: x + 34 * s, y: y - 40 * s }], { width: 5, seed: seed + 1, alpha });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 37101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 37102 });

  const quiet = S.at(sec, DOWN, DOWN + 0.4);
  // The speaker on the wall, pulsing, with notes pouring out (fewer once it's turned down).
  const pulse = (1 - quiet) * Math.abs(Math.sin(sec * 10)) * 0.08;
  ctx.save(); ctx.translate(880, 720); ctx.scale(1 + pulse, 1 + pulse);
  pen.shape(ctx, pen.roundRect(-90, -110, 180, 220, 20), { fill: C.ink, width: 6, seed: 37103, offset: 0 });
  pen.shape(ctx, pen.ellipse(0, 30, 55, 55, 24), { fill: C.muted, width: 5, seed: 37104, offset: 0 });
  pen.shape(ctx, pen.ellipse(0, -60, 25, 25, 16), { fill: C.muted, width: 4, seed: 37105, offset: 0 });
  ctx.restore();
  const n = Math.round(9 - 7 * quiet);
  for (let i = 0; i < n; i++) {
    const ph = (sec * 0.6 + i / 9) % 1;
    note(ctx, 790 - ph * 480 + Math.sin(sec * 3 + i) * 30, 730 + ph * 200 + (i % 3) * 40, 1.1, 37110 + i * 2, 1 - ph * 0.5);
  }

  // The volume knob, turning down.
  const kx = 880, ky = 950, a = -2.2 + 3.96 * (1 - quiet);
  pen.shape(ctx, pen.ellipse(kx, ky, 50, 50, 24), { fill: C.card, width: 6, seed: 37130, offset: 0 });
  pen.line(ctx, [{ x: kx, y: ky }, { x: kx + Math.cos(a - Math.PI / 2) * 40, y: ky + Math.sin(a - Math.PI / 2) * 40 }], { width: 7, color: theme.accent, seed: 37131 });

  // Maria and Priya at the table.
  tomato(ctx, 'Maria', 250, 1270, 440, { squash: S.breathe(sec), angle: 0.06 });
  tomato(ctx, 'Priya', 650, 1270, 440, { squash: S.breathe(sec + 1), angle: quiet < 1 ? -0.14 : -0.04 });
  if (quiet < 1) S.reaction(ctx, theme, 'sweat', 650, 1200, S.seg(sec, 0.8, 1.4));
  else S.reaction(ctx, theme, 'joy', 650, 1200, S.seg(sec, DOWN + 0.4, DOWN + 1.0));
  pen.shape(ctx, pen.ellipse(440, 1420, 260, 40, 28), { fill: C.card, width: 6, seed: 37140, offset: 0 });
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 37141 });

  // Maria's bubble: scrambled squiggles while it's loud, real words once it's down.
  const k = S.pop(sec, 0.3, 0.3);
  S.popIn(ctx, k, 300, 1080, () => {
    bubble(ctx, 60, 900, 480, 170, 260, 1070, C.card, 37150);
    if (quiet < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - quiet;
      for (let r = 0; r < 2; r++) {
        const pts = []; for (let x = 110; x <= 490; x += 10) pts.push({ x, y: 960 + r * 55 + Math.sin(x / 9 + sec * 14 + r) * 10 });
        pen.line(ctx, pts, { width: 6, color: C.muted, seed: 37151 + r });
      }
      ctx.restore();
    }
    if (quiet > 0) text(ctx, props.words || '', 300, 1005, { size: 66, align: 'center', alpha: quiet });
  });
}

hook.cues = () => [{ sec: 0, sfx: 'blip', gain: 0.35 }, { sec: 0.4, sfx: 'blip', gain: 0.35 }, { sec: 0.8, sfx: 'blip', gain: 0.35 }, { sec: 1.2, sfx: 'blip', gain: 0.35 }, { sec: DOWN, sfx: 'tick', gain: 0.5 }, { sec: DOWN + 0.4, sfx: 'chime', gain: 0.4 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
