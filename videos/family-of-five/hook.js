// This video's own hook.
//
// The idea: the door swings open and a family of five piles in one after another, two big, three
// small, plus a stroller rolling in on its own, while every table on the floor plan in the
// background already has a tomato at it. Roma Tom's eyes go from table to table.
// Frame one shows: the door already swinging open, the first parent stepping in.
// Readable by 0.5 s: "Family of five. *Zero free tables.*"
// The open loop: what happens next? (Everyone knows. And it's fine.)
//
// props: { label, line }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1540;
const FAMILY = [['Leo', 0.0, 300, 160], ['Ana', 0.3, 300, 360], ['Sam', 0.6, 190, 520], ['Priya', 0.85, 170, 640], ['Ivan', 1.1, 150, 750]];
const TABLES = [[200, 720], [460, 720], [720, 720], [960, 720]];
const SEATED = ['Maria', 'Dev', 'Theo', 'Rosa'];

function stroller(ctx, x, y) {
  pen.shape(ctx, [{ x: x - 70, y: y - 130 }, { x: x + 50, y: y - 130 }, { x: x + 70, y: y - 60 }, { x: x - 70, y: y - 60 }], { fill: C.sky, width: 5, seed: 36110, offset: 0 });
  pen.line(ctx, [{ x: x + 50, y: y - 130 }, { x: x + 100, y: y - 190 }], { width: 6, seed: 36111 });
  [-45, 45].forEach((dx, i) => pen.shape(ctx, pen.ellipse(x + dx, y - 22, 22, 22, 16), { fill: C.card, width: 5, seed: 36112 + i, offset: 0 }));
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 36101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 108, maxW: 880, appear: S.at(sec, 0, 0.2), seed: 36102 });

  // The dining room, every table already taken.
  TABLES.forEach(([x, y], i) => {
    tomato(ctx, SEATED[i], x, y - 50, 190, { squash: S.breathe(sec + i) });
    pen.shape(ctx, pen.ellipse(x, y + 30, 110, 28, 24), { fill: C.card, width: 5, seed: 36120 + i, offset: 0 });
  });
  // Roma Tom on the right, looking from table to table.
  const look = Math.sin(sec * 4) * 0.15;
  tomato(ctx, 'Roma Tom', 950, 1080, 280, { angle: look, squash: S.breathe(sec) });
  S.reaction(ctx, theme, 'sweat', 900, 1040, S.seg(sec, 1.4, 2.0));

  // The family pouring in from the left, the stroller rolling in last.
  FAMILY.forEach(([name, s0, size, to], i) => {
    if (sec < s0) return;
    const w = S.walk(sec, -150, to, s0, s0 + 0.7, FLOOR - 10);
    tomato(ctx, name, w.x, w.y - size * 0.42, size, { angle: w.angle });
  });
  if (sec > 1.3) { const w = S.walk(sec, -150, 900, 1.3, 2.1, FLOOR); stroller(ctx, w.x, FLOOR); }
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 36140 });
}

hook.cues = () => [...FAMILY.map(([, s]) => ({ sec: s, sfx: 'tap', gain: 0.35 })), { sec: 1.3, sfx: 'rustle', gain: 0.4 }, { sec: 1.6, sfx: 'boing', gain: 0.35 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
