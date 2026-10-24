// What each background sticker does when pressed (StickerPlay.tsx catches the press).
// Each trick moves the sticker's inner .play box, so the slot's own tilt and bob stay put,
// and puts its lettering, flash, bubble or goal on the layer above the page.
// With reduced motion the lettering just fades in and out and nothing flies.

const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const POP = "cubic-bezier(.3,1.6,.5,1)";
const IN = "cubic-bezier(0.55, 0, 1, 0.45)";
const RISE = "cubic-bezier(0.2, 0.6, 0.4, 1)"; // thrown up, slowing at the top
const DROP = "cubic-bezier(0.6, 0, 0.8, 0.4)"; // falling, speeding up

export type Ctx = { sticker: HTMLElement; play: HTMLElement; layer: HTMLElement; still: boolean };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const done = (a: Animation) => a.finished.then(() => {}, () => {});
const q = <T extends Element = HTMLElement>(el: Element, sel: string) => el.querySelector(sel) as T;

/** Comic lettering next to the sticker, on the side facing the page. */
function sfx(ctx: Ctx, text: string, color: string, { tilt = -6, size = 1, at = 0.25, ms = 1100 } = {}) {
  const r = ctx.sticker.getBoundingClientRect();
  const s = document.createElement("span");
  s.className = "sfx";
  s.textContent = text;
  s.style.setProperty("--c", color);
  s.style.fontSize = `calc(var(--sfx) * ${size})`;
  s.style.top = `${Math.max(8, r.top + r.height * at)}px`;
  if (r.left + r.width / 2 < innerWidth / 2) s.style.left = `${r.right + 6}px`;
  else s.style.right = `${innerWidth - r.left + 6}px`;
  ctx.layer.append(s);
  const t = `rotate(${tilt}deg)`;
  const a = ctx.still
    ? s.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], ms)
    : s.animate(
        [
          { opacity: 0, transform: `${t} scale(1.7)`, easing: POP },
          { opacity: 1, transform: `${t} scale(1)`, offset: 0.2 },
          { opacity: 1, transform: `${t} scale(1)`, offset: 0.78, easing: IN },
          { opacity: 0, transform: `${t} translateY(-0.4em)` },
        ],
        ms,
      );
  done(a).then(() => s.remove());
  return a;
}

/** Plant: the top jaw swings open on its hinge and slams shut; the plant squashes on the bite. */
async function plant({ play, still }: Ctx) {
  const jaw = q(play, ".plant-jaw");
  if (!jaw) return;
  const bite = jaw.animate(
    [
      { transform: "rotate(0deg)", easing: OUT },
      { transform: "rotate(-16deg)", offset: 0.4, easing: IN },
      { transform: "rotate(1.5deg)", offset: 0.62, easing: OUT },
      { transform: "rotate(0deg)" },
    ],
    { duration: still ? 300 : 420 },
  );
  if (!still)
    play.animate(
      [
        { scale: "1", easing: OUT },
        { scale: "0.98 1.03", offset: 0.4, easing: IN },
        { scale: "1.05 0.94", offset: 0.62, easing: OUT },
        { scale: "1" },
      ],
      420,
    );
  await done(bite);
}

/** Camera: its flash goes off, a burst of light over the camera alone. */
async function camera({ sticker, play, layer, still }: Ctx) {
  // centred on the flash in the hump above the lens, measured on today's picture
  const r = sticker.getBoundingClientRect();
  const d = r.width * 1.5;
  const flash = document.createElement("div");
  flash.className = "camera-flash";
  Object.assign(flash.style, { left: `${r.left + r.width * 0.59 - d / 2}px`, top: `${r.top + r.height * 0.15 - d / 2}px`, width: `${d}px`, height: `${d}px` });
  layer.append(flash);
  if (!still) play.animate([{ scale: "1" }, { scale: "0.94", offset: 0.3 }, { scale: "1" }], { duration: 260, easing: OUT });
  // one flash at a time: the press is ignored until this one is over
  await done(
    still
      ? flash.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.3 }, { opacity: 0 }], 600)
      : flash.animate(
          [{ opacity: 0, transform: "scale(0.5)" }, { opacity: 1, transform: "scale(1)", offset: 0.1 }, { opacity: 0, transform: "scale(1.15)" }],
          { duration: 480, easing: "ease-out" },
        ),
  );
  flash.remove();
  await wait(250);
}

/** Climbing hold: a chalky hand print slaps on, the hold drops off the wall, then sticks back on. */
async function hold({ sticker, play, still }: Ctx) {
  const chalk = q(play, ".hold-chalk");
  const print = chalk.animate(
    [{ opacity: 0, transform: "scale(1.2) rotate(-6deg)" }, { opacity: 0.92, transform: "scale(1) rotate(-6deg)" }],
    { duration: still ? 200 : 140, easing: OUT, fill: "forwards" },
  );
  if (still) {
    await wait(900);
    print.cancel();
    return;
  }
  // a puff of chalk dust off the hand
  const w = play.offsetWidth;
  for (let i = 0; i < 7; i++) {
    const d = document.createElement("span");
    d.className = "hold-dust";
    play.append(d);
    const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
    const far = w * (0.3 + Math.random() * 0.25);
    done(
      d.animate(
        [{ opacity: 0.9, transform: "translate(-50%, -50%)" }, { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(a) * far}px), calc(-50% + ${Math.sin(a) * far}px)) scale(1.6)` }],
        { duration: 520 + Math.random() * 200, easing: OUT },
      ),
    ).then(() => d.remove());
  }
  await wait(320);
  await done(play.animate([{ rotate: "0deg" }, { rotate: "5deg" }, { rotate: "-4deg" }, { rotate: "2deg" }, { rotate: "0deg" }], { duration: 320, easing: "ease-in-out" }));
  const r = sticker.getBoundingClientRect();
  const fall = play.animate(
    [{ transform: "none" }, { transform: `translateY(${innerHeight - r.top + r.height}px) rotate(32deg)` }],
    { duration: 650, easing: IN, fill: "forwards" },
  );
  await done(fall);
  print.cancel();
  await wait(450);
  fall.cancel();
  // slapped back on the wall
  await done(play.animate([{ opacity: 0, transform: "scale(1.3)" }, { opacity: 1, transform: "scale(1)" }], { duration: 320, easing: POP }));
}

/** Curious George: the top scoop falls off and splats, leaves a drip, then a fresh one lands. */
async function george(ctx: Ctx) {
  const { play, still } = ctx;
  const scoop = q(play, ".george-scoop");
  const drip = q(play, ".george-drip");
  const drops = [...play.querySelectorAll<SVGPathElement>(".george-drip .drop")];
  const showDrip = () => {
    const a = [drip.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" })];
    drops.forEach((d, i) =>
      a.push(d.animate([{ transform: "scaleY(0.25)" }, { transform: "scaleY(1)" }], { duration: 1600, delay: 120 + i * 180, easing: OUT, fill: "both" })),
    );
    return a;
  };
  if (still) {
    const gone = scoop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
    const melt = showDrip();
    await wait(2200);
    melt.forEach((a) => a.cancel());
    gone.cancel();
    return;
  }
  const h = play.offsetHeight;
  const fall = scoop.animate(
    [
      { transform: "none", easing: OUT },
      { transform: "translateY(-3%) rotate(-7deg)", offset: 0.14, easing: IN },
      { transform: `translateY(${h * 0.8}px) rotate(16deg)`, offset: 0.62, easing: OUT },
      { transform: `translateY(${h * 0.8}px) rotate(16deg) scale(1.5, 0.45)`, offset: 0.72 },
      { transform: `translateY(${h * 0.8}px) rotate(16deg) scale(1.6, 0.4)`, opacity: 1, offset: 0.9 },
      { transform: `translateY(${h * 0.8}px) rotate(16deg) scale(1.6, 0.4)`, opacity: 0 },
    ],
    { duration: 1000, fill: "forwards" },
  );
  await wait(140);
  const melt = showDrip();
  await done(fall);
  await wait(1800);
  // a fresh scoop drops back on top; the drip melts away under it
  fall.cancel();
  melt.forEach((a) => a.cancel());
  await done(
    scoop.animate(
      [
        { opacity: 0, transform: "translateY(-14%)", easing: IN },
        { opacity: 1, transform: "translateY(0)", offset: 0.6, easing: OUT },
        { transform: "scale(1.12, 0.9)", offset: 0.8 },
        { transform: "none" },
      ],
      { duration: 460 },
    ),
  );
}

/** Agüero jersey: it spins, with AGÜEROOOO! */
async function jersey(ctx: Ctx) {
  sfx(ctx, "AGÜEROOOO!", "var(--city)", { tilt: -5, size: 1.15, ms: 1600 });
  if (ctx.still) return wait(1600);
  await done(
    ctx.play.animate(
      [
        { transform: "rotate(0deg) scale(1)", easing: IN_OUT },
        { transform: "rotate(380deg) scale(1.18)", offset: 0.45, easing: OUT },
        { transform: "rotate(720deg) scale(1)" },
      ],
      { duration: 1200 },
    ),
  );
}

/** Guitar: the strings wobble and the guitar rocks. */
async function guitar(ctx: Ctx) {
  const strings = q(ctx.play, ".guitar-strings");
  if (ctx.still) return;
  const on = strings.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 900, fill: "both" });
  const swing = [1, -0.9, 0.75, -0.6, 0.45, -0.32, 0.2, -0.1, 0];
  [...strings.querySelectorAll("path")].forEach((p, i) =>
    // a strum sweeps across: each string starts a moment after the last, and rings a little faster
    p.animate([{ transform: "scaleX(0)" }, ...swing.map((k) => ({ transform: `scaleX(${k})` }))], {
      duration: 760 - i * 40,
      delay: i * 22,
      easing: "linear",
    }),
  );
  ctx.play.animate([{ rotate: "0deg" }, { rotate: "-4deg" }, { rotate: "3deg" }, { rotate: "-1.5deg" }, { rotate: "0deg" }], { duration: 700, easing: OUT });
  await done(on);
  on.cancel();
}

/** Gromit: a curious head tilt and a heart in a speech bubble. */
async function gromit(ctx: Ctx) {
  const r = ctx.sticker.getBoundingClientRect();
  const left = r.left + r.width / 2 < innerWidth / 2;
  const bubble = document.createElement("span");
  bubble.className = `bubble ${left ? "bubble-l" : "bubble-r"}`;
  bubble.textContent = "❤️";
  bubble.style.top = `${Math.max(8, r.top - r.height * 0.15)}px`;
  if (left) bubble.style.left = `${r.right - r.width * 0.15}px`;
  else bubble.style.right = `${innerWidth - r.left - r.width * 0.15}px`;
  ctx.layer.append(bubble);
  const pop = ctx.still
    ? bubble.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }], 1700)
    : bubble.animate(
        [
          { opacity: 0, transform: "translateY(30%) scale(0.6)", easing: POP },
          { opacity: 1, transform: "none", offset: 0.16 },
          { opacity: 1, transform: "none", offset: 0.86, easing: IN },
          { opacity: 0, transform: "translateY(-20%)" },
        ],
        1700,
      );
  if (!ctx.still)
    ctx.play.animate(
      [
        { transform: "rotate(0deg)", easing: OUT },
        { transform: `rotate(${left ? 13 : -13}deg)`, offset: 0.2 },
        { transform: `rotate(${left ? 13 : -13}deg)`, offset: 0.75, easing: IN_OUT },
        { transform: "rotate(0deg)" },
      ],
      1600,
    );
  await done(pop);
  bubble.remove();
}

const GOAL = `<svg viewBox="0 0 160 104" aria-hidden="true">
  <g class="goal-net" stroke="rgba(255,255,255,.6)" stroke-width="1.4">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${14 + i * 11}" y1="12" x2="${10 + i * 11.5}" y2="100"/>`).join("")}
    ${Array.from({ length: 8 }, (_, i) => `<line x1="10" y1="${14 + i * 12}" x2="150" y2="${14 + i * 12}"/>`).join("")}
  </g>
  <path d="M8 102 V8 H152 V102" fill="none" stroke="#14213d" stroke-width="11" stroke-linejoin="round"/>
  <path d="M8 102 V8 H152 V102" fill="none" stroke="#fbfaf6" stroke-width="6" stroke-linejoin="round"/>
</svg>`;

/** Football: two bounces on the spot, then it flies into a goal that pops up beside it. */
async function ball(ctx: Ctx) {
  const { sticker, play, layer, still } = ctx;
  const r = sticker.getBoundingClientRect();
  const left = r.left + r.width / 2 < innerWidth / 2;
  const gw = r.width * 2.4;
  const gh = gw * 0.65;
  const gx = Math.min(Math.max(8, left ? r.right + r.width * 1.4 : r.left - r.width * 1.4 - gw), innerWidth - gw - 8);
  const gy = Math.min(Math.max(8, r.bottom - gh + r.height * 0.6), innerHeight - gh - 8);
  const goal = document.createElement("div");
  goal.className = "goal";
  goal.innerHTML = GOAL;
  Object.assign(goal.style, { left: `${gx}px`, top: `${gy}px`, width: `${gw}px` });
  layer.append(goal);
  const tilt = left ? -3 : 3;
  const goalIn = goal.animate(
    [{ opacity: 0, transform: `translateY(15%) rotate(${tilt * 3}deg)` }, { opacity: 1, transform: `rotate(${tilt}deg)` }],
    { duration: still ? 200 : 300, easing: OUT, fill: "forwards" },
  );

  // the ball that flies is a copy on the layer above the page; the sticker hides meanwhile
  const fly = document.createElement("div");
  fly.className = "fly";
  const spin = document.createElement("div");
  spin.append(play.cloneNode(true));
  fly.append(spin);
  Object.assign(fly.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  const dx = gx + gw * 0.55 - (r.left + r.width / 2);
  const dy = gy + gh * 0.62 - (r.top + r.height / 2);

  if (still) {
    fly.style.transform = `translate(${dx}px, ${dy}px) scale(0.75)`;
    layer.append(fly);
    play.style.opacity = "0";
    await done(fly.animate([{ opacity: 0 }, { opacity: 1 }], 200));
    await wait(1100);
  } else {
    await done(
      play.animate(
        [
          { transform: "translateY(0) scale(1, 1)", easing: RISE },
          { transform: "translateY(-60%) scale(0.96, 1.04)", offset: 0.26, easing: DROP },
          { transform: "translateY(0) scale(1.14, 0.86)", offset: 0.5, easing: RISE },
          { transform: "translateY(-32%) scale(1, 1)", offset: 0.73, easing: DROP },
          { transform: "translateY(0) scale(1.1, 0.9)", offset: 0.92 },
          { transform: "translateY(0) scale(1, 1)" },
        ],
        { duration: 760 },
      ),
    );
    layer.append(fly);
    play.style.opacity = "0";
    // across in a straight line, up and down in an arc, spinning and shrinking into the net
    const across = fly.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], { duration: 620, easing: "cubic-bezier(0.3, 0.1, 0.6, 1)", fill: "forwards" });
    spin.animate(
      [
        { transform: "translateY(0) rotate(0deg) scale(1)", easing: OUT },
        { transform: `translateY(${Math.min(dy, 0) - r.height * 1.4}px) rotate(300deg) scale(0.9)`, offset: 0.45, easing: IN },
        { transform: `translateY(${dy}px) rotate(620deg) scale(0.7)` },
      ],
      { duration: 620, fill: "forwards" },
    );
    await done(across);
    // the net bulges back and the ball drops inside it
    q(goal, ".goal-net").animate(
      [{ transform: "none" }, { transform: `translateX(${left ? 6 : -6}%) scale(1.06, 1.03)`, offset: 0.35 }, { transform: "none" }],
      { duration: 500, easing: OUT },
    );
    spin.animate(
      [{ transform: `translateY(${dy}px) rotate(620deg) scale(0.7)` }, { transform: `translateY(${dy + gh * 0.22}px) rotate(680deg) scale(0.7)` }],
      { duration: 380, easing: "cubic-bezier(0.5, 0, 0.75, 0)", fill: "forwards" },
    );
    await wait(1000);
  }

  await Promise.all([done(goal.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" })), done(fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" }))]);
  goalIn.cancel();
  goal.remove();
  fly.remove();
  play.style.opacity = "";
  await done(
    still
      ? play.animate([{ opacity: 0 }, { opacity: 1 }], 200)
      : play.animate([{ opacity: 0, transform: "scale(1.3)" }, { opacity: 1, transform: "scale(1)" }], { duration: 320, easing: POP }),
  );
}

export const MOVES: Record<string, (ctx: Ctx) => Promise<void>> = { plant, camera, hold, george, jersey, guitar, gromit, ball };
