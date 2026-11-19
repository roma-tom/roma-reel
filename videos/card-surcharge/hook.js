// This video's own hook.
//
// The idea: a guest holds up their check as it slides out of the check holder; the lines
// print in, then a surprise line ("Card fee 3%") stamps in rose at the bottom, gets circled,
// and the guest jumps back in shock.
// Frame one shows: the check already sliding up out of its black holder, the guest leaning in.
// Readable by 0.5 s: "Wait. What's this *fee*?" under the CAFE OWNERS pill.
// The open loop: a card fee on the check. Should an owner pass it on to guests, or not?
//
// props: { label, line, name, items: [{ label, amount }], fee: { label, amount } }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, money, loop, dashed } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const FEE = 1.05, CIRCLE = 1.35, SHOCK = 1.3;
const K = { x: 510, y: 700, w: 430, h: 700 }; // the check

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 3.2;
  const name = props.name || 'Jess';
  const items = props.items || [];
  const fee = props.fee || { label: 'Card fee', amount: 0 };

  kicker(ctx, props.label || '', W / 2 - 60, 250, { seed: 16101 });
  headline(ctx, theme, props.line || '', { x: W / 2 - 60, y: 320, size: 120, maxW: 840, appear: S.at(sec, 0, 0.2), seed: 16102 });

  // The guest on the left, leaning toward the check, jumping back when the fee lands.
  const j = S.jump(sec, SHOCK, 40);
  const lean = sec < SHOCK ? 0.1 : 0.1 - 0.16 * S.at(sec, SHOCK, SHOCK + 0.25);
  const gx = 250 - (sec > SHOCK ? 30 * S.at(sec, SHOCK, SHOCK + 0.25) : 0), gy = 1220 - j.hop;
  tomato(ctx, name, gx, gy, 440, { squash: j.squash, angle: lean });

  // The check sliding up out of its holder, with a gentle sway.
  const slide = (1 - S.at(sec, 0, 0.5)) * 260;
  const sway = Math.sin(sec * 2.2) * 0.02;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, K.y + K.h); ctx.clip();
  ctx.translate(K.x + K.w / 2, K.y + K.h); ctx.rotate(sway); ctx.translate(-(K.x + K.w / 2), -(K.y + K.h));
  ctx.translate(0, slide);
  const zig = [{ x: K.x, y: K.y }];
  for (let i = 0; i <= 10; i++) zig.push({ x: K.x + (K.w * i) / 10, y: K.y + (i % 2 ? -14 : 0) });
  zig.push({ x: K.x + K.w, y: K.y + K.h }, { x: K.x, y: K.y + K.h });
  pen.shape(ctx, zig, { fill: C.card, width: 5, seed: 16103, offset: 0 });
  text(ctx, 'CHECK', K.x + K.w / 2, K.y + 70, { size: 30, font: 'Inter', weight: 600, spacing: 6, align: 'center', color: C.muted });
  dashed(ctx, K.x + 30, K.x + K.w - 30, K.y + 100, C.line, 16104);
  items.slice(0, 4).forEach((it, i) => {
    const a = S.at(sec, 0.15 + i * 0.18, 0.35 + i * 0.18);
    const y = K.y + 170 + i * 80;
    text(ctx, it.label, K.x + 34, y, { size: 58, alpha: a });
    text(ctx, money(it.amount), K.x + K.w - 34, y, { size: 58, align: 'right', alpha: a });
  });
  // The surprise line, stamped in rose, then circled.
  const fy = K.y + 170 + Math.min(items.length, 4) * 80 + 40;
  const k = S.pop(sec, FEE, 0.3);
  S.popIn(ctx, k, K.x + K.w / 2, fy - 16, () => {
    text(ctx, fee.label, K.x + 34, fy, { size: 54, color: C.rose });
    text(ctx, money(fee.amount), K.x + K.w - 34, fy, { size: 54, align: 'right', color: C.rose });
  });
  loop(ctx, K.x + K.w / 2, fy - 16, K.w / 2 + 6, 48, S.at(sec, CIRCLE, CIRCLE + 0.4), theme.accent, 16105, 8);
  ctx.restore();

  // The black check holder the check slides out of.
  pen.shape(ctx, pen.roundRect(K.x - 30, K.y + K.h - 40, K.w + 60, 240, 22), { fill: C.ink, width: 6, seed: 16106, offset: 0 });
  pen.line(ctx, [{ x: K.x + 10, y: K.y + K.h + 20 }, { x: K.x + K.w - 10, y: K.y + K.h + 18 }], { width: 4, color: C.muted, seed: 16107 });

  S.reaction(ctx, theme, 'shock', gx, gy, S.seg(sec, SHOCK, SHOCK + 0.4));
}

hook.cues = () => [
  { sec: 0, sfx: 'swish', gain: 0.45 },
  { sec: 0.2, sfx: 'tick', gain: 0.3 },
  { sec: FEE, sfx: 'pop', gain: 0.7 },
  { sec: CIRCLE, sfx: 'scratch', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
