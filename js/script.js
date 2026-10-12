/* ============================================================
   Textos de la intro (edítalos aquí)
   ============================================================ */
const INTRO_LINES = [
  "Hay algo que quiero darte...",
  "pero está guardado bajo llave.",
  "Toca la llave para abrirlo.",
];

const $ = (id) => document.getElementById(id);
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* ================= INTRO ================= */
const intro = $("intro");
const introText = $("intro-text");
const envelope = $("envelope");
const key = $("key");
const bookView = $("book-view");

async function escribirIntro() {
  for (const linea of INTRO_LINES) {
    for (const letra of linea) {
      introText.textContent += letra;
      await esperar(55);
    }
    introText.textContent += "\n";
    await esperar(500);
  }
  key.hidden = false;
}

async function abrirSobre() {
  key.disabled = true;
  key.classList.add("usada");

  // 1. La llave viaja hasta el candado
  const k = key.getBoundingClientRect();
  const e = envelope.getBoundingClientRect();
  const dx = e.left + e.width * 0.498 - (k.left + k.width / 2);
  const dy = e.top + e.height * 0.54 - (k.top + k.height / 2);
  key.style.transform = `translate(${dx}px, ${dy}px) scale(.5)`;
  await esperar(1000);

  // 2. Gira
  key.classList.add("girando");
  key.style.transform = `translate(${dx}px, ${dy}px) scale(.5) rotate(90deg)`;
  await esperar(650);

  // 3. El sobre se sacude, se abre y desaparece
  key.classList.add("oculta");
  envelope.classList.add("sacudir");
  await esperar(450);
  envelope.classList.add("fuera");
  intro.classList.add("saliendo");
  await esperar(750);

  // 4. Pasamos al libro
  intro.hidden = true;
  bookView.hidden = false;
  render();
}

key.addEventListener("click", abrirSobre);
escribirIntro();

/* ================= LIBRO ================= */
const book = $("book");
const pages = [...document.querySelectorAll(".page")];
const prev = $("prev");
const next = $("next");
let actual = 0;


function render(dir = 0) {
  pages.forEach((p, i) => {
    p.hidden = i !== actual;
  });
  prev.disabled = actual === 0;
  next.disabled = actual + 1 >= pages.length;

  if (dir) {
    book.animate(
      [
        { opacity: 0, transform: `translateX(${dir * 24}px)` },
        { opacity: 1, transform: "none" },
      ],
      { duration: 320, easing: "ease-out" }
    );
  }
}

function ir(dir) {
  const nuevo = actual + dir;
  if (nuevo < 0 || nuevo >= pages.length) return;
  actual = nuevo;
  render(dir);
}

prev.addEventListener("click", () => ir(-1));
next.addEventListener("click", () => ir(1));

document.addEventListener("keydown", (ev) => {
  if (bookView.hidden || !modal.hidden) return;
  if (ev.key === "ArrowRight") ir(1);
  if (ev.key === "ArrowLeft") ir(-1);
});

// Deslizar con el dedo
let inicioX = null;
bookView.addEventListener("touchstart", (ev) => (inicioX = ev.touches[0].clientX), { passive: true });
bookView.addEventListener("touchend", (ev) => {
  if (inicioX === null) return;
  const dx = ev.changedTouches[0].clientX - inicioX;
  if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1);
  inicioX = null;
});

/* ================= EASTER EGG ================= */
const modal = $("modal");
const video = $("video");

function abrirVideo() {
  modal.hidden = false;
  video.currentTime = 0;
  video.play().catch(() => {});
}
function cerrarVideo() {
  video.pause();
  modal.hidden = true;
}

$("egg").addEventListener("click", abrirVideo);
$("modal-close").addEventListener("click", cerrarVideo);
modal.addEventListener("click", (ev) => { if (ev.target === modal) cerrarVideo(); });
document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !modal.hidden) cerrarVideo(); });
