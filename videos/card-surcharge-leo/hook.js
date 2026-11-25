// This video's own hook.
//
// The idea: Leo is handed his check; it unrolls, he reads down it happily, then a line he
// didn't expect gets circled in red and he jolts.
// Frame one shows: the check already unrolling in Leo's direction.
// Readable by 0.5 s: "Wait. *What's this fee?*"
// The open loop: should you pass card fees on, and how?
//
// props: { label, line, rows: [[label, amount], ...], flag (index of the surprise row) }

const { W, C, kicker, headline, tomato, pen } = require('../../scripts/lib/kit.js');
const { text, loop } = require('../../scripts/lib/marks.js');
const S = require('../../scripts/lib/stage.js');

const CHECK = { x: 400, y: 640, w: 530 }, CIRCLE = 1.9;

function hook(ctx, theme, t, props, info = {}) {
  const sec = info.sec ?? t * 4;
  kicker(ctx, props.label || '', W / 2, 260, { seed: 21101 });
  headline(ctx, theme, props.line || '', { x: W / 2, y: 330, size: 116, maxW: 860, appear: S.at(sec, 0, 0.2), seed: 21102 });

  // The check unrolls downward, line by line.
  const rows = props.rows || [], flag = props.flag ?? rows.length - 1;
  const full = 120 + rows.length * 110;
  const h = 60 + (full - 60) * S.at(sec, 0, 1.0);
  pen.shape(ctx, pen.roundRect(CHECK.x, CHECK.y, CHECK.w, h, 10), { fill: C.card, width: 6, seed: 21110, offset: 0 });
  ctx.save(); ctx.beginPath(); ctx.rect(CHECK.x, CHECK.y, CHECK.w, h); ctx.clip();
  rows.forEach(([label, amount], i) => {
    const y = CHECK.y + 110 + i * 110;
    const c = i === flag ? theme.accent : C.ink;
    text(ctx, label, CHECK.x + 36, y, { size: 50, color: c });
    text(ctx, amount, CHECK.x + CHECK.w - 36, y, { size: 50, align: 'right', color: c });
  });
  ctx.restore();
  const fy = CHECK.y + 110 + flag * 110 - 18;
  if (sec > CIRCLE) loop(ctx, CHECK.x + CHECK.w / 2, fy, CHECK.w / 2 + 10, 58, S.at(sec, CIRCLE, CIRCLE + 0.4), theme.accent, 21120, 9);

  // Leo reading along, then jolting at the circled line.
  const j = S.jump(sec, CIRCLE + 0.2, 70);
  const shocked = sec > CIRCLE + 0.2;
  tomato(ctx, 'Leo', 210, 1280 - j.hop, 520, { squash: j.squash, angle: shocked ? -0.12 : 0.06 + Math.sin(sec * 2) * 0.03 });
  if (shocked) S.reaction(ctx, theme, 'shock', 210, 1230, S.seg(sec, CIRCLE + 0.2, CIRCLE + 0.6));
  else S.reaction(ctx, theme, 'think', 170, 1230, S.seg(sec, 0.3, 0.8));
  pen.line(ctx, [{ x: -40, y: 1480 }, { x: 1120, y: 1476 }], { width: 7, seed: 21130 });
}

hook.cues = () => [
  { sec: 0, sfx: 'rustle', gain: 0.45 }, { sec: CIRCLE, sfx: 'scratch', gain: 0.45 }, { sec: CIRCLE + 0.2, sfx: 'boing', gain: 0.5 },
];
hook.cover = (p) => ({ kicker: p.label, headline: p.line });

module.exports = hook;
