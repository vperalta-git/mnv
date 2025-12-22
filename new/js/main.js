import { highlights } from "./data/highlights.js";
import { months } from "./data/months.js";

function renderHighlights() {
  const grid = document.getElementById("highlight-grid");
  if (!grid) return;
  grid.innerHTML = highlights
    .map(
      (h) => `
        <article class="relative overflow-hidden rounded-2xl border border-blush/30 bg-ink/70 backdrop-blur shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1">
          <div class="absolute inset-0 bg-gradient-to-br ${h.tone} opacity-40 animate-glow"></div>
          <div class="relative p-5 flex flex-col gap-2 min-h-[170px]">
            <p class="text-xs uppercase tracking-[0.2em] text-blush/70">${h.date || "Add date"}</p>
            <h3 class="text-xl font-semibold text-blush">${h.title || "Add highlight"}</h3>
            <p class="text-sm text-blush/70">${h.blurb || "Add a line or leave blank"}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderMonths() {
  const grid = document.getElementById("month-grid");
  grid.innerHTML = months
    .map(
      (m) => {
        const slug = m.name.toLowerCase();
        return `
        <a href="./months/${slug}.html" class="relative overflow-hidden rounded-2xl border border-blush/30 bg-ink/70 backdrop-blur shadow-xl shadow-black/40 transition duration-300 hover:-translate-y-1 block">
          <div class="absolute inset-0">
            ${m.thumbnail ? `<div class="absolute inset-0 bg-cover" style="background-image: url('${m.thumbnail}'); background-position: ${m.bgPosition || "center"};"></div>` : ""}
            <div class="absolute inset-0 bg-gradient-to-br ${m.color} opacity-30 animate-glow"></div>
            <div class="absolute inset-0 bg-ink/50"></div>
          </div>
          <div class="relative p-6 flex flex-col gap-4 min-h-[220px]">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-semibold text-blush">${m.name}</h3>
              <span class="text-xs uppercase tracking-[0.2em] text-mint/80">2025</span>
            </div>
            <p class="text-sm text-blush/70">${m.summary || "Add month note"}</p>
            <p class="text-sm text-mint/80 italic">${m.notes || "Add detail here"}</p>
            <div class="text-xs text-blush/50">Tap to open month page</div>
          </div>
        </a>
      `;
      }
    )
    .join("");
}

renderHighlights();
renderMonths();

// Petal animation (canvas-based for smoother movement)
function initPetals() {
  const canvas = document.getElementById("petal-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let scale = 1;

  const petalCount = 40;
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
      size: 3 + Math.random() * 4,
      speedY: 22 + Math.random() * 22,
      speedX: (Math.random() - 0.5) * 12,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
      sway: (Math.random() - 0.5) * 0.3
    };
  }

  function resetPetal(p) {
    p.x = Math.random() * width;
    p.y = -p.size;
    p.size = 3 + Math.random() * 4;
    p.speedY = 22 + Math.random() * 22;
    p.speedX = (Math.random() - 0.5) * 12;
    p.rotation = Math.random() * Math.PI;
    p.spin = (Math.random() - 0.5) * 0.02;
    p.sway = (Math.random() - 0.5) * 0.3;
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
initPetals();

// Letter overlay logic
const overlay = document.getElementById("letter-overlay");
const envelopeCard = document.getElementById("envelope-card");
const letterContent = document.getElementById("letter-content");
const openLetterBtn = document.getElementById("open-letter");
const closeLetterBtn = document.getElementById("close-letter");
const doneLetterBtn = document.getElementById("done-letter");
const reopenLetterBtn = document.getElementById("reopen-letter");

function showOverlay() {
  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  envelopeCard.classList.remove("hidden");
  letterContent.classList.add("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
  overlay.classList.remove("flex");
}

function openEnvelope() {
  envelopeCard.classList.add("hidden");
  letterContent.classList.remove("hidden");
  letterContent.classList.add("animate-pop");
  setTimeout(() => letterContent.classList.remove("animate-pop"), 400);
}

function markDone() {
  localStorage.setItem("letterDone", "true");
  hideOverlay();
}

openLetterBtn?.addEventListener("click", openEnvelope);
closeLetterBtn?.addEventListener("click", hideOverlay);
doneLetterBtn?.addEventListener("click", markDone);
reopenLetterBtn?.addEventListener("click", () => {
  localStorage.removeItem("letterDone");
  showOverlay();
});

if (localStorage.getItem("letterDone") !== "true") {
  showOverlay();
}
