// This video's own hook.
//
// The idea: a barista tomato, apron off and in her hand, is walking out the door for good. A
// one-dollar coin rolls in across the floor and stops at her feet, and she stops too.
// Frame one shows: Lina already mid-stride toward the door, the coin already rolling.
// Readable by 0.5 s: "STAFF" and "$1 an hour, or *$2,000*?"
// The open loop: is one dollar an hour really enough to keep her, and is it worth it?
//
// props: { label, line, coin, cost, name }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const GROUND = 1500, STOP = 1.25, DOOR = { x: 700, w: 230, top: 860 };
const COIN_R = 64, FEET = 330, SIZE = 430;

function door(ctx, theme, open) {
  // The frame, the dark gap of the open door, and the door itself swung partly open.
  pen.shape(ctx, pen.roundRect(DOOR.x - 16, DOOR.top - 16, DOOR.w + 32, GROUND - DOOR.top + 16, 12), { fill: C.card, width: 6, seed: 18010, offset: 0 });
  pen.shape(ctx, pen.roundRect(DOOR.x, DOOR.top, DOOR.w, GROUND - DOOR.top, 8), { fill: C.ink, width: 5, seed: 18011, offset: 0 });
  const sw = DOOR.w * (1 - 0.55 * open);
  pen.shape(ctx, [{ x: DOOR.x, y: DOOR.top }, { x: DOOR.x + sw, y: DOOR.top + 30 }, { x: DOOR.x + sw, y: GROUND - 30 }, { x: DOOR.x, y: GROUND }],
    { fill: C.tomato, width: 6, seed: 18012, offset: 0 });
  pen.shape(ctx, pen.ellipse(DOOR.x + sw - 30, (DOOR.top + GROUND) / 2, 12, 12, 12), { fill: C.butter, width: 4, seed: 18013, offset: 0 });
}

function apron(ctx, x, y, swing) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(swing);
  pen.line(ctx, [{ x: -10, y: -40 }, { x: 0, y: -80 }, { x: 10, y: -40 }], { width: 5, seed: 18020 });
  pen.shape(ctx, [{ x: -38, y: -40 }, { x: 38, y: -40 }, { x: 52, y: 90 }, { x: -52, y: 90 }], { fill: C.forest, width: 6, seed: 18021, offset: 0 });
  pen.line(ctx, [{ x: -30, y: 30 }, { x: 30, y: 30 }], { width: 4, color: C.card, seed: 18022 });
  ctx.restore();
}

function rollingCoin(ctx, theme, label, x, spin) {
  const y = GROUND - COIN_R;
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  pen.shape(ctx, pen.ellipse(0, 0, COIN_R, COIN_R, 28), { fill: C.butter, width: 6, seed: 18030, offset: 0 });
  pen.shape(ctx, pen.ellipse(0, 0, COIN_R - 14, COIN_R - 14, 24), { width: 3, seed: 18031, offset: 0 });
  text(ctx, label, 0, 20, { size: 64, align: 'center' });
  ctx.restore();
}

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 270, { seed: 18001 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 340, size: 124, maxW: 820, appear: S.at(sec, 0, 0.2), seed: 18002 });

  // The floor and the door she is heading for.
  pen.line(ctx, [{ x: 40, y: GROUND + 2 }, { x: 1040, y: GROUND - 2 }], { width: 6, seed: 18003 });
  door(ctx, theme, 1 - S.at(sec, STOP, STOP + 0.5));

  // Lina walks toward the door, apron in hand, and stops dead when the coin reaches her.
  const name = props.name || 'Lina';
  const g = S.seg(sec, -0.2, STOP), moving = g > 0 && g < 1;
  const w = { x: 200 + 300 * g, y: GROUND - SIZE * 0.361 - (moving ? Math.abs(Math.sin(sec * 12)) * 20 : 0), angle: moving ? 0.08 : 0 };
  const j = S.jump(sec, STOP, 46);
  const turn = S.at(sec, STOP + 0.15, STOP + 0.5);
  tomato(ctx, name, w.x, w.y - j.hop, SIZE, { squash: j.squash, angle: w.angle * (1 - turn) - 0.12 * turn });
  apron(ctx, w.x + 175, w.y + 50 - j.hop, sec < STOP ? Math.sin(sec * 9) * 0.25 : 0.05);

  // The coin rolls in from the left edge and settles at her feet.
  const p = S.at(sec, 0, STOP, S.easeOut);
  const cx = -60 + (FEET - -60) * p;
  const wob = sec > STOP ? Math.sin((sec - STOP) * 18) * 0.12 * Math.max(0, 1 - (sec - STOP) * 2) : 0;
  rollingCoin(ctx, theme, props.coin || '$1', cx, (cx + 60) / COIN_R + wob);
  if (sec < STOP) {
    [0, 1].forEach((i) => pen.line(ctx, [{ x: cx - 90 - i * 40, y: GROUND - 30 - i * 34 }, { x: cx - 150 - i * 40, y: GROUND - 30 - i * 34 }], { width: 5, color: C.muted, seed: 18040 + i }));
  }

  // She notices; then what walking out the door would cost pops in, pointing at it.
  S.reaction(ctx, theme, 'shock', w.x, w.y + 40 - j.hop, S.seg(sec, STOP, STOP + 0.4));
  S.pointer(ctx, theme, props.cost || '', 440, 760, DOOR.x + 40, DOOR.top + 40, S.pop(sec, STOP + 0.45, 0.3), S.at(sec, STOP + 0.55, STOP + 0.9), 18050);
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.35 }, { sec: 0.35, sfx: 'tick', gain: 0.3 }, { sec: 0.75, sfx: 'tick', gain: 0.3 },
  { sec: STOP, sfx: 'clink', gain: 0.6 }, { sec: STOP + 0.05, sfx: 'boing', gain: 0.4 }, { sec: STOP + 0.45, sfx: 'pop', gain: 0.45 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
