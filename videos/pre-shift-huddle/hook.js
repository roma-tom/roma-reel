// This video's own hook.
//
// The idea: a split second of chaos versus calm. On the left, Dev, Ana and Leo run in circles
// with question marks over their heads while a timer races; then Roma Tom's whistle blows and
// they snap into a tidy huddle around him, a five-minute sand timer on the counter.
// Frame one shows: the team already scrambling, question marks popping.
// Readable by 0.5 s: "Five minutes *before you open*."
// The open loop: what do you say in those five minutes?
//
// props: { label, line, mark }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const WHISTLE = 1.9, FLOOR = 1480;
const TEAM = [['Dev', 0], ['Ana', 2.1], ['Leo', 4.2]];
const SPOTS = [[290, 1290], [540, 1330], [790, 1290]];

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 27101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 112, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 27102 });

  const gather = S.at(sec, WHISTLE, WHISTLE + 0.6);
  // Roma Tom with a whistle in the middle, appearing as the team gathers.
  S.popIn(ctx, S.pop(sec, WHISTLE - 0.2, 0.35), 540, 1100, () => {
    tomato(ctx, 'Roma Tom', 540, 1000, 360, { squash: S.breathe(sec) });
    pen.shape(ctx, pen.ellipse(600, 1010, 26, 18, 14), { fill: C.butter, width: 4, seed: 27110, offset: 0 });
  });
  if (sec > WHISTLE && sec < WHISTLE + 0.5) [-0.4, 0, 0.4].forEach((a, i) => pen.line(ctx, [{ x: 640 + Math.cos(a) * 20, y: 1000 + Math.sin(a) * 20 }, { x: 640 + Math.cos(a) * 80, y: 1000 + Math.sin(a) * 80 }], { width: 7, color: theme.accent, seed: 27111 + i }));

  // The team: scrambling around in circles, then snapping into the huddle.
  TEAM.forEach(([name, ph], i) => {
    const a = sec * 4.5 + ph;
    const cx = 540 + Math.cos(a) * 280, cy = 1250 + Math.sin(a) * 130;
    const [hx, hy] = SPOTS[i];
    const x = cx + (hx - cx) * gather, y = cy + (hy - cy) * gather;
    tomato(ctx, name, x, y, 320, { angle: (1 - gather) * Math.sin(a) * 0.3, squash: S.breathe(sec + i) });
    if (gather < 1) text(ctx, props.mark || '', x + 70, y - 140, { size: 90, color: theme.accent, alpha: 1 - gather });
  });
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 27120 });

  // A five-minute sand timer on the floor at the right, sand running once the huddle starts.
  const sx = 975, sy = 1460, sand = S.at(sec, WHISTLE + 0.4, WHISTLE + 3, (x) => x);
  pen.shape(ctx, [{ x: sx - 50, y: sy - 180 }, { x: sx + 50, y: sy - 180 }, { x: sx, y: sy - 90 }], { fill: C.card, width: 5, seed: 27130, offset: 0 });
  pen.shape(ctx, [{ x: sx, y: sy - 90 }, { x: sx + 50, y: sy }, { x: sx - 50, y: sy }], { fill: C.card, width: 5, seed: 27131, offset: 0 });
  if (sand < 1) pen.fill(ctx, [{ x: sx - 40 * (1 - sand), y: sy - 170 + 70 * sand }, { x: sx + 40 * (1 - sand), y: sy - 170 + 70 * sand }, { x: sx, y: sy - 95 }], C.butter, { seed: 27132 });
  if (sand > 0) pen.fill(ctx, [{ x: sx - 40 * sand, y: sy - 4 }, { x: sx + 40 * sand, y: sy - 4 }, { x: sx, y: sy - 4 - 70 * sand }], C.butter, { seed: 27133 });
}

hook.cues = () => [
  { sec: 0, sfx: 'tick', gain: 0.4 }, { sec: 0.5, sfx: 'tick', gain: 0.4 }, { sec: 1.0, sfx: 'tick', gain: 0.45 }, { sec: 1.4, sfx: 'tick', gain: 0.5 },
  { sec: WHISTLE, sfx: 'ding', gain: 0.6 }, { sec: WHISTLE + 0.3, sfx: 'pop', gain: 0.4 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
