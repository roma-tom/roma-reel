// This video's own hook.
//
// The idea: a shiny kiosk screen rolls in next to the counter. Maria walks up, taps the screen,
// and a cascade of pop-ups keeps appearing (ADD A TIP? / MAKE IT LARGE? / ADD A COOKIE?) while
// she squints; behind the counter, Roma Tom waves and she looks over at him instead.
// Frame one shows: the kiosk already rolling in.
// Readable by 0.5 s: "The kiosk: *friend or foe*?"
// The open loop: does it help or hurt?
//
// props: { label, line, popups: [three short lines] }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const FLOOR = 1520, TAP = 1.0, POPS = [1.2, 1.6, 2.0], WAVE = 2.5;
const K = { x: 90, y: 620, w: 440, h: 600 };

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 40101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 40102 });

  // The kiosk rolls in from the left.
  const roll = S.at(sec, 0, 0.6);
  const kx = K.x - (1 - roll) * 500;
  pen.shape(ctx, pen.roundRect(kx, K.y, K.w, K.h, 24), { fill: C.ink, width: 6, seed: 40103, offset: 0 });
  pen.fill(ctx, pen.roundRect(kx + 24, K.y + 24, K.w - 48, K.h - 160, 14), C.sky, { seed: 40104 });
  pen.shape(ctx, pen.roundRect(kx + K.w / 2 - 50, K.y + K.h, 100, FLOOR - K.y - K.h, 6), { fill: C.muted, width: 5, seed: 40105, offset: 0 });
  // Pop-ups stacking on the screen.
  (props.popups || []).forEach((p, i) => {
    const k = S.pop(sec, POPS[i], 0.25);
    if (k <= 0) return;
    const py = K.y + 70 + i * 120;
    S.popIn(ctx, k, kx + K.w / 2, py + 40, () => {
      pen.shape(ctx, pen.roundRect(kx + 40, py, K.w - 80, 96, 12), { fill: C.card, width: 4, seed: 40110 + i, offset: 0 });
      text(ctx, p, kx + K.w / 2, py + 60, { size: 32, align: 'center', font: 'Inter', weight: 700 });
    });
  });

  // Maria at the kiosk, squinting at it, then turning to look at Roma Tom.
  const turn = S.at(sec, WAVE, WAVE + 0.3);
  tomato(ctx, 'Maria', 650, 1340, 380, { angle: -0.15 + turn * 0.32, squash: S.breathe(sec), mouth: sec > POPS[2] && sec < WAVE ? 0.4 : undefined });
  if (sec > TAP && sec < WAVE) S.reaction(ctx, theme, 'sweat', 640, 1290, S.seg(sec, POPS[1], POPS[1] + 0.5));
  if (sec > WAVE) S.reaction(ctx, theme, 'joy', 650, 1290, S.seg(sec, WAVE + 0.2, WAVE + 0.8));

  // Roma Tom behind the counter on the right, waving.
  const wave = sec > WAVE ? Math.sin(sec * 14) * 0.15 : 0;
  tomato(ctx, 'Roma Tom', 960, 1130, 320, { angle: wave, squash: S.breathe(sec + 1) });
  pen.shape(ctx, [{ x: 820, y: 1250 }, { x: 1120, y: 1246 }, { x: 1120, y: FLOOR }, { x: 820, y: FLOOR }], { fill: C.card, width: 6, seed: 40120, offset: 0 });
  pen.line(ctx, [{ x: -40, y: FLOOR }, { x: 1120, y: FLOOR - 4 }], { width: 7, seed: 40121 });
}

hook.cues = () => [{ sec: 0, sfx: 'rustle', gain: 0.35 }, { sec: TAP, sfx: 'tap', gain: 0.45 }, ...POPS.map((sec) => ({ sec, sfx: 'blip', gain: 0.45 })), { sec: WAVE, sfx: 'chime', gain: 0.4 }];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
