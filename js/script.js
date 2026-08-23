// =========================================================
// TorqueMax — configuração central (DEMO)
// Troque estes valores pelos dados reais da oficina.
// =========================================================
const CONFIG = {
  // Número no formato internacional, só dígitos: 55 + DDD + número
  whatsappNumber: "5511900000000",
  defaultMessage: "Olá! Vim pelo site da TorqueMax e gostaria de mais informações.",
  instagramUrl: "https://instagram.com/torquemax.oficina",

  // Horário de funcionamento usado no indicador "Aberto agora" do topo.
  // 0 = domingo ... 6 = sábado. null = fechado no dia.
  businessHours: {
    0: null,
    1: [8, 18],
    2: [8, 18],
    3: [8, 18],
    4: [8, 18],
    5: [8, 18],
    6: [8, 13],
  },
};

function buildWhatsAppLink(message) {
  const text = encodeURIComponent(message || CONFIG.defaultMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function wireWhatsAppLinks() {
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.setAttribute("href", buildWhatsAppLink(el.getAttribute("data-msg")));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

function wireInstagramLinks() {
  document.querySelectorAll('[id^="instagramLink"]').forEach((el) => {
    el.setAttribute("href", CONFIG.instagramUrl);
  });
}

function updateOpenStatus() {
  const el = document.getElementById("openStatus");
  if (!el) return;
  const textEl = el.querySelector(".status-text");

  const now = new Date();
  const day = now.getDay();
  const hourDecimal = now.getHours() + now.getMinutes() / 60;
  const range = CONFIG.businessHours[day];
  const isOpen = !!range && hourDecimal >= range[0] && hourDecimal < range[1];

  el.classList.remove("is-open", "is-closed");
  el.classList.add(isOpen ? "is-open" : "is-closed");
  textEl.textContent = isOpen ? "Aberto agora" : "Fechado no momento";
}

function setupMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  if (!hamburger || !nav) return;

  const closeNav = () => {
    nav.classList.remove("is-open");
    hamburger.classList.remove("is-active");
    hamburger.setAttribute("aria-expanded", "false");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    hamburger.classList.toggle("is-active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
}

function setupHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 500),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupRevealOnScroll() {
  const targets = document.querySelectorAll(
    ".service-card, .brand-chip, .process__step, .testimonial-card, .faq-item"
  );
  if (!("IntersectionObserver" in window) || !targets.length) return;

  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity .5s ease, transform .5s ease";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  wireWhatsAppLinks();
  wireInstagramLinks();
  updateOpenStatus();
  setupMobileNav();
  setupHeaderScroll();
  setupBackToTop();
  setupRevealOnScroll();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setInterval(updateOpenStatus, 60000);
});
