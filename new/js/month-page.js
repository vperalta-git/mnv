import { months } from "./data/months.js";

function slugify(name) {
  return name.toLowerCase();
}

function getMonthData(target) {
  return months.find((m) => slugify(m.name) === slugify(target));
}

function renderPhotos(list = []) {
  if (!list.length) {
    return `<div class="rounded-xl border border-blush/25 bg-ink/80 p-4 text-sm text-blush/60">No photos yet</div>`;
  }

  return `
    <div class="grid gap-5 sm:grid-cols-2">
      ${list
        .map(
          (p) => `
            <figure class="rounded-2xl border border-blush/30 bg-gradient-to-br from-ink/85 via-ink/70 to-ink/60 shadow-xl shadow-black/40 p-3">
              ${p.src
                ? `<img src="${p.src}" alt="${p.alt || ""}" class="w-full h-auto rounded-xl shadow-lg shadow-black/40 max-h-[70vh] object-contain" loading="lazy" />`
                : `<div class="h-48 w-full bg-gradient-to-br from-blush/20 to-mint/20 flex items-center justify-center text-blush/60 text-sm rounded-xl">No photo</div>`}
              <figcaption class="px-1 pt-3 text-sm text-blush/80">${p.caption || ""}</figcaption>
            </figure>
          `
        )
        .join("")}
    </div>
  `;
}

export function renderMonthPage(monthSlug) {
  const month = getMonthData(monthSlug);
  if (!month) return;

  const heading = document.getElementById("month-heading");
  const summary = document.getElementById("month-summary");
  const notes = document.getElementById("month-notes");
  const photosSlot = document.getElementById("photos-slot");

  heading.textContent = month.name;
  summary.textContent = month.summary || "";
  notes.textContent = month.notes || "";
  photosSlot.innerHTML = renderPhotos(month.photos);
}

export function initPetals() {
  const canvas = document.getElementById("petal-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let scale = 1;

  const petalCount = 35;
  const petals = [];

  function resize() {
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function makePetal() {
    return {
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: 3 + Math.random() * 3.5,
      speedY: 20 + Math.random() * 20,
      speedX: (Math.random() - 0.5) * 10,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
      sway: (Math.random() - 0.5) * 0.25
    };
  }

  function resetPetal(p) {
    p.x = Math.random() * width;
    p.y = -p.size;
    p.size = 3 + Math.random() * 3.5;
    p.speedY = 20 + Math.random() * 20;
    p.speedX = (Math.random() - 0.5) * 10;
    p.rotation = Math.random() * Math.PI;
    p.spin = (Math.random() - 0.5) * 0.02;
    p.sway = (Math.random() - 0.5) * 0.25;
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = 0.45;
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
    grd.addColorStop(0, "#ffe6ef");
    grd.addColorStop(1, "#f6c4d4");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.6);
    ctx.bezierCurveTo(p.size, -p.size, p.size, p.size, 0, p.size);
    ctx.bezierCurveTo(-p.size, p.size, -p.size, -p.size, 0, -p.size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function update(delta) {
    ctx.clearRect(0, 0, width, height);
    petals.forEach((p) => {
      p.y += (p.speedY * delta) / 1000;
      p.x += (p.speedX * delta) / 1000;
      p.x += Math.sin(p.y * 0.01) * p.sway;
      p.rotation += p.spin * delta;

      if (p.y - p.size > height) {
        resetPetal(p);
      } else if (p.x < -p.size) {
        p.x = width + p.size;
      } else if (p.x > width + p.size) {
        p.x = -p.size;
      }

      drawPetal(p);
    });
  }

  let last = performance.now();
  function loop(now) {
    const delta = now - last;
    last = now;
    update(delta);
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);
  for (let i = 0; i < petalCount; i++) {
    petals.push(makePetal());
  }
  requestAnimationFrame(loop);
}
