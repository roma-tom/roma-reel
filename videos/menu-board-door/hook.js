// This video's own hook.
//
// The idea: Priya stands at the door squinting at the menu board on the back wall, which is a
// mess of tiny scribbles; she leans in, squints harder, and the board blurs; then it snaps into
// three big clear lines and she lights up.
// Frame one shows: Priya already squinting, leaning toward the tiny board.
// Readable by 0.5 s: "Can they read it *from the door*?"
// The open loop: how big does the writing need to be?
//
// props: { label, line, items: [three big menu lines] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const SNAP = 2.3, B = { x: 380, y: 620, w: 600, h: 520 };

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 32101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 32102 });

  // The menu board on the back wall.
  pen.shape(ctx, pen.roundRect(B.x, B.y, B.w, B.h, 16), { fill: C.ink, width: 7, seed: 32103, offset: 0 });
  const clear = S.at(sec, SNAP, SNAP + 0.3);
  if (clear < 1) {
    // Tiny, crowded scribbles, wobbling as if out of focus.
    ctx.save(); ctx.globalAlpha *= 1 - clear;
    for (let r = 0; r < 14; r++) {
      const y = B.y + 40 + r * 34, jit = Math.sin(sec * 9 + r) * 3 * Math.min(1, sec / 1.5);
      pen.line(ctx, [{ x: B.x + 40 + jit, y }, { x: B.x + 40 + 200 + ((r * 53) % 150) + jit, y }], { width: 5, color: C.card, seed: 32110 + r });
      pen.line(ctx, [{ x: B.x + B.w - 120 - jit, y }, { x: B.x + B.w - 50 - jit, y }], { width: 5, color: C.card, seed: 32130 + r });
    }
    ctx.restore();
  }
  if (clear > 0) {
    (props.items || []).forEach((it, i) => text(ctx, it, B.x + B.w / 2, B.y + 150 + i * 150, { size: 96, align: 'center', color: C.card, alpha: clear }));
  }

  // Priya at the door, leaning in and squinting, then lighting up.
  const lean = sec < SNAP ? S.at(sec, 0, 1.6) : 1 - S.at(sec, SNAP, SNAP + 0.4);
  const j = S.jump(sec, SNAP + 0.1, 50);
  tomato(ctx, 'Priya', 230 + lean * 50, 1300 - j.hop, 520, { angle: 0.18 * lean, squash: j.squash, mouth: sec < SNAP ? 0.3 : undefined });
  if (sec < SNAP) S.reaction(ctx, theme, 'think', 160, 1240, S.seg(sec, 0.3, 0.9));
  else S.reaction(ctx, theme, 'joy', 240, 1260, S.seg(sec, SNAP + 0.1, SNAP + 0.7));
  pen.line(ctx, [{ x: -40, y: 1500 }, { x: 1120, y: 1496 }], { width: 7, seed: 32150 });
}

hook.cues = () => [{ sec: 0, sfx: 'tap', gain: 0.3 }, { sec: 1.2, sfx: 'rustle', gain: 0.35 }, { sec: SNAP, sfx: 'pop', gain: 0.5 }, { sec: SNAP + 0.1, sfx: 'chime', gain: 0.45 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
