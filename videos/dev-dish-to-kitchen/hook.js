// This video's own hook.
//
// The idea: Dev at the dish pit, elbow-deep in bubbles; with each beat his hat grows, from
// nothing to a cap to a tall chef's hat, while the sink in front of him turns into the pass with
// tickets on the rail.
// Frame one shows: Dev scrubbing, bubbles already rising.
// Readable by 0.5 s: "From the dish pit to *the pass*."
// The open loop: how did he get there?
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const STEPS = [0.7, 1.4, 2.1], PASS = 2.1, COUNTER = 1320;

function hat(ctx, x, y, stage, k) {
  if (stage < 1) return;
  S.popIn(ctx, k, x, y, () => {
    if (stage === 1) {
      pen.shape(ctx, pen.roundRect(x - 90, y - 50, 180, 56, 20), { fill: C.sky, width: 5, seed: 25110, offset: 0 });
    } else {
      const tall = stage === 2 ? 80 : 170;
      pen.shape(ctx, pen.roundRect(x - 80, y - 40, 160, 46, 10), { fill: C.card, width: 5, seed: 25111, offset: 0 });
      [[-50, -40 - tall * 0.6, 55], [0, -40 - tall, 65], [50, -40 - tall * 0.6, 55]].forEach(([dx, dy, r], i) =>
        pen.shape(ctx, pen.ellipse(x + dx, y + dy, r, r * 0.9, 20), { fill: C.card, width: 5, seed: 25112 + i, offset: 0 }));
      pen.shape(ctx, [{ x: x - 75, y: y - 40 }, { x: x + 75, y: y - 40 }, { x: x + 60, y: y - 40 - tall * 0.6 }, { x: x - 60, y: y - 40 - tall * 0.6 }], { fill: C.card, width: 0, seed: 25116, offset: 0 });
    }
  });
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 25101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 25102 });

  const stage = STEPS.filter((s) => sec >= s).length;
  const atPass = sec >= PASS;

  // The ticket rail appears behind him once he's at the pass.
  if (atPass) {
    const k = S.at(sec, PASS, PASS + 0.4);
    pen.line(ctx, [{ x: 60, y: 640 }, { x: 1020, y: 640 }], { width: 8, seed: 25120 });
    [130, 290, 790, 950].forEach((x, i) => S.popIn(ctx, S.pop(sec, PASS + 0.1 * i, 0.3), x, 640, () => {
      pen.shape(ctx, pen.roundRect(x - 60, 640, 120, 150, 6), { fill: C.card, width: 4, seed: 25121 + i, offset: 0, alpha: k });
      [680, 720, 760].forEach((y, r) => pen.line(ctx, [{ x: x - 40, y }, { x: x + 30 - r * 12, y }], { width: 4, color: C.muted, seed: 25130 + i * 3 + r }));
    }));
  }

  // Dev: scrubbing at first, then standing tall.
  const scrub = atPass ? 0 : Math.sin(sec * 26) * 8;
  const j = S.jump(sec, STEPS[stage - 1] ?? -1, 40);
  const y = 1150 - (stage >= 0 ? j.hop : 0);
  tomato(ctx, 'Dev', 540 + scrub, y, 500, { squash: j.squash, angle: atPass ? 0 : Math.sin(sec * 20) * 0.04 });
  hat(ctx, 540 + scrub, y - 100, stage, S.pop(sec, STEPS[stage - 1] ?? 0, 0.3));
  if (atPass) S.reaction(ctx, theme, 'joy', 540, 1120, S.seg(sec, PASS, PASS + 0.6));

  // The counter: a sink full of bubbles, then the steel pass.
  S.counter(ctx, COUNTER);
  if (!atPass) {
    pen.shape(ctx, pen.roundRect(300, COUNTER - 30, 480, 70, 16), { fill: C.sky, width: 6, seed: 25140, offset: 0 });
    for (let i = 0; i < 8; i++) {
      const ph = (sec * 1.6 + i * 0.37) % 1;
      pen.shape(ctx, pen.ellipse(330 + ((i * 97) % 420), COUNTER - 30 - ph * 200, 14 + (i % 3) * 8, 14 + (i % 3) * 8, 16), { fill: C.card, width: 4, seed: 25150 + i, offset: 0, alpha: 1 - ph });
    }
  } else {
    pen.shape(ctx, pen.roundRect(220, COUNTER - 30, 640, 40, 10), { fill: C.line, width: 6, seed: 25160, offset: 0 });
  }
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.3 }, ...STEPS.map((sec) => ({ sec, sfx: 'pop', gain: 0.5 })), { sec: PASS + 0.1, sfx: 'ding', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
