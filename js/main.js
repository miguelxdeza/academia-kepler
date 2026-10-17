// Academia Kepler · interacciones
const WHATSAPP = "51958707899"; // número principal (cambiar aquí si es otro)
const INICIO = new Date("2026-11-02T07:30:00-05:00"); // inicio del ciclo (hora de Perú)

// ---- Enlaces de WhatsApp con mensaje prellenado ----
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = "_blank";
  a.rel = "noopener";
});

// ---- Cielo estrellado animado ----
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];
let shooting = null;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = Math.round((innerWidth * innerHeight) / 5000);
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.4 + 0.2,
    z: Math.random() * 0.8 + 0.2, // profundidad para el parallax
    t: Math.random() * Math.PI * 2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const sy = scrollY;
  for (const s of stars) {
    s.t += 0.02;
    const y = (s.y - sy * s.z * 0.15) % innerHeight;
    const a = 0.45 + Math.sin(s.t) * 0.35;
    ctx.beginPath();
    ctx.arc(s.x, y < 0 ? y + innerHeight : y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.z > 0.85 ? `rgba(46,242,192,${a})` : `rgba(255,255,255,${a})`;
    ctx.fill();
  }
  // estrella fugaz de vez en cuando
  if (!shooting && Math.random() < 0.006) {
    shooting = { x: Math.random() * innerWidth, y: Math.random() * innerHeight * 0.5, life: 1 };
  }
  if (shooting) {
    const { x, y, life } = shooting;
    const grad = ctx.createLinearGradient(x, y, x - 120, y - 50);
    grad.addColorStop(0, `rgba(46,242,192,${life})`);
    grad.addColorStop(1, "rgba(46,242,192,0)");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 120, y - 50);
    ctx.stroke();
    shooting.x += 12;
    shooting.y += 5;
    shooting.life -= 0.02;
    if (shooting.life <= 0) shooting = null;
  }
  if (!reduceMotion) requestAnimationFrame(draw);
}
addEventListener("resize", resize);
resize();
draw();

// ---- Nav: fondo al hacer scroll + menú móvil ----
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.classList.remove("open");
  })
);

// ---- Aparición al hacer scroll ----
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ---- Robot del hero sigue el mouse ----
const robot = document.getElementById("heroRobot");
if (robot && matchMedia("(hover: hover)").matches) {
  addEventListener("mousemove", (e) => {
    const x = (e.clientX / innerWidth - 0.5) * 24;
    const y = (e.clientY / innerHeight - 0.5) * 24;
    robot.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.25}deg)`;
  });
}

// ---- Tarjetas con inclinación 3D y brillo ----
document.querySelectorAll(".tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg)`;
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  });
  card.addEventListener("mouseleave", () => (card.style.transform = ""));
});

// ---- Cuenta regresiva ----
const pad = (n) => String(n).padStart(2, "0");
function tick() {
  const ms = INICIO - Date.now();
  if (ms <= 0) {
    document.querySelector(".cd-title").textContent = "¡Ya despegamos! 🚀 Aún puedes unirte";
    return;
  }
  const s = Math.floor(ms / 1000);
  document.getElementById("cdD").textContent = pad(Math.floor(s / 86400));
  document.getElementById("cdH").textContent = pad(Math.floor((s % 86400) / 3600));
  document.getElementById("cdM").textContent = pad(Math.floor((s % 3600) / 60));
  document.getElementById("cdS").textContent = pad(s % 60);
  setTimeout(tick, 1000);
}
tick();

// ---- Reto Kepler ----
const opts = document.querySelectorAll("#retoOpts button");
const msg = document.getElementById("retoMsg");
opts.forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.ok) {
      b.classList.add("ok");
      opts.forEach((o) => (o.disabled = true));
      msg.innerHTML = "<strong>¡Correcto! 🎉</strong> Cada gato caza 1 ratón cada 3 minutos. En 100 minutos, 3 gatos cazan ~100 ratones. ¡Tienes madera de ingresante!";
      confetti(b);
    } else {
      b.classList.remove("bad");
      void b.offsetWidth;
      b.classList.add("bad");
      msg.textContent = "Casi… 🤔 piensa cuántos ratones caza UN gato en 3 minutos.";
    }
  })
);

function confetti(el) {
  const r = el.getBoundingClientRect();
  const colors = ["#2ef2c0", "#22a37e", "#38d9f5", "#ffffff", "#ffd166"];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement("i");
    p.style.cssText = `position:fixed;z-index:200;left:${r.left + r.width / 2}px;top:${r.top}px;width:8px;height:12px;border-radius:2px;background:${colors[i % colors.length]};pointer-events:none`;
    document.body.appendChild(p);
    const dx = (Math.random() - 0.5) * 500;
    const dy = -Math.random() * 380 - 80;
    p.animate(
      [{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${dx}px, ${dy + 600}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
      { duration: 1600 + Math.random() * 800, easing: "cubic-bezier(.2,.6,.4,1)" }
    ).onfinish = () => p.remove();
  }
}

// ---- Galería con lightbox ----
const lb = document.getElementById("lightbox");
if (lb) {
  const lbImg = lb.querySelector("img");
  document.querySelectorAll(".gallery figure").forEach((f) =>
    f.addEventListener("click", () => {
      const img = f.querySelector("img");
      lbImg.src = img.dataset.full || img.src;
      lbImg.alt = img.alt;
      lb.classList.add("open");
    })
  );
  lb.addEventListener("click", () => lb.classList.remove("open"));
  addEventListener("keydown", (e) => e.key === "Escape" && lb.classList.remove("open"));
}

document.getElementById("year").textContent = new Date().getFullYear();
