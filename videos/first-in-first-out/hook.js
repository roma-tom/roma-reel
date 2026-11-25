// This video's own hook.
//
// The idea: a shelf in the walk-in. A fresh tub slides in at the front, shoving yesterday's tub
// to the back, again and again; the one at the very back goes fuzzy and green, then tips off into
// the trash with a coin falling after it.
// Frame one shows: a fresh tub already sliding in at the front.
// Readable by 0.5 s: "New in front. *Old in the trash.*"
// The open loop: how much does that cost, and how do you stop it?
//
// props: { label, line, tag }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const SHELF = 1080, PUSH = [0, 0.8, 1.6], DUMP = 2.4, TW = 190, X0 = 260;

function tub(ctx, x, y, mold, label, seed) {
  pen.shape(ctx, [{ x: x - TW / 2, y: y - 150 }, { x: x + TW / 2, y: y - 150 }, { x: x + TW / 2 - 14, y }, { x: x - TW / 2 + 14, y }], { fill: C.card, width: 6, seed, offset: 0 });
  pen.shape(ctx, pen.roundRect(x - TW / 2 - 8, y - 172, TW + 16, 30, 8), { fill: mold > 0.5 ? C.forest : C.sky, width: 5, seed: seed + 1, offset: 0 });
  if (label) {
    pen.shape(ctx, pen.roundRect(x - 60, y - 110, 120, 50, 6), { fill: C.butter, width: 3, seed: seed + 2, offset: 0 });
    text(ctx, label, x, y - 74, { size: 30, align: 'center', font: 'Inter', weight: 700 });
  }
  if (mold > 0) [[-50, -30], [20, -50], [55, -20], [-10, -80], [40, -120]].forEach(([dx, dy], i) =>
    pen.fill(ctx, pen.ellipse(x + dx, y + dy, 18 * mold, 14 * mold, 12), C.forest, { seed: seed + 5 + i }));
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 29101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 29102 });

  // How many tubs have been pushed in so far, and how far the latest push has gone.
  const pushed = PUSH.filter((p) => sec >= p).length;
  const slide = S.at(sec, PUSH[pushed - 1], PUSH[pushed - 1] + 0.45);
  // Tubs on the shelf, newest at the front (left) and oldest at the back (right).
  // The oldest starts on the shelf already; each push shifts everything one slot to the right.
  const n = pushed + 1;
  for (let i = 0; i < n; i++) {
    const age = n - 1 - i; // 0 = newest
    let slot = age - 1 + slide; // the newest slides in from slot -1
    let x = X0 + slot * (TW + 30), y = SHELF;
    const oldest = i === 0;
    const mold = oldest ? S.at(sec, 0.8, 2.2) : 0;
    if (oldest && sec > DUMP) {
      const f = S.at(sec, DUMP, DUMP + 0.6, (v) => v * v);
      x = X0 + 3 * (TW + 30) + f * 30; y = SHELF + f * 420;
      ctx.save(); ctx.translate(x, y); ctx.scale(1 - 0.35 * f, 1 - 0.35 * f); ctx.rotate(0.5 * f);
      tub(ctx, 0, 0, mold, props.tag, 29110 + age * 20);
      ctx.restore();
      continue;
    }
    if (x > -TW) tub(ctx, x, y, mold, oldest ? props.tag : '', 29110 + age * 20);
  }
  // The shelf, the trash can below the back of it, and a coin following the old tub in.
  pen.shape(ctx, pen.roundRect(40, SHELF, 870, 26, 8), { fill: C.line, width: 6, seed: 29150, offset: 0 });
  pen.shape(ctx, [{ x: 840, y: 1380 }, { x: 1050, y: 1380 }, { x: 1025, y: 1560 }, { x: 865, y: 1560 }], { fill: C.ink, width: 6, seed: 29151, offset: 0 });
  pen.shape(ctx, pen.roundRect(825, 1360, 240, 26, 8), { fill: C.ink, width: 5, seed: 29152, offset: 0 });
  S.coin(ctx, theme, 760, 1000, 950, 1380, S.seg(sec, DUMP + 0.4, DUMP + 1.0), 29160, 32, 120);

  // Dev pushing tubs in from the left, oblivious.
  tomato(ctx, 'Dev', 180, 1450, 380, { squash: S.breathe(sec), angle: 0.08 + Math.sin(sec * 3) * 0.03 });
  if (sec > DUMP + 0.4) S.reaction(ctx, theme, 'shock', 180, 1400, S.seg(sec, DUMP + 0.4, DUMP + 0.8));
}

hook.cues = () => [...PUSH.map((sec) => ({ sec, sfx: 'swish', gain: 0.4 })), { sec: DUMP + 0.3, sfx: 'squish', gain: 0.5 }, { sec: DUMP + 0.9, sfx: 'clink', gain: 0.5 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
