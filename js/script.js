// =========================================================
// Klaus — configuração central (DEMO)
// Troque estes valores pelos dados reais da oficina.
// =========================================================
const CONFIG = {
  // Número no formato internacional, só dígitos: 55 + DDD + número
  whatsappNumber: "5511900000000",
  defaultMessage: "Olá! Vim pelo site da oficina Klaus e gostaria de mais informações.",
  instagramUrl: "https://instagram.com/klaus.oficina",

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

function setupScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupCountUp() {
  const targets = document.querySelectorAll("[data-count]");
  if (!("IntersectionObserver" in window) || !targets.length) return;

  const animateCount = (el) => {
    const end = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = end * eased;
      el.textContent = value.toLocaleString("pt-BR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  targets.forEach((el) => observer.observe(el));
}

function setupScrollShow() {
  const track = document.querySelector(".scrollshow__track");
  const images = document.querySelectorAll(".scrollshow__img");
  const bar = document.getElementById("scrollshowBar");
  const indexEl = document.getElementById("scrollshowIndex");
  const titleEl = document.getElementById("scrollshowTitle");
  const textEl = document.getElementById("scrollshowText");
  const hint = document.querySelector(".scrollshow__hint");
  if (!track || !images.length) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));

    if (progress > 0.02 && hint) hint.classList.add("is-hidden");

    const activeIndex = Math.min(images.length - 1, Math.floor(progress * images.length));

    images.forEach((img, i) => img.classList.toggle("is-active", i === activeIndex));

    const active = images[activeIndex];
    if (indexEl) indexEl.textContent = String(activeIndex + 1);
    if (titleEl) titleEl.textContent = active.getAttribute("data-title") || "";
    if (textEl) textEl.textContent = active.getAttribute("data-text") || "";
    if (bar) bar.style.width = `${progress * 100}%`;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

function setupRevealOnScroll() {
  const targets = document.querySelectorAll(
    ".service-card, .brand-chip, .process__step, .testimonial-card, .faq-item, .section-head, .calendar-card, .location__item, .ig-tile"
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

function setupImageFallback() {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => img.closest("picture, .service-card__media, .ig-tile, .hero__bg, .scrollshow__frames")?.classList.add("img-fallback"), { once: true });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireWhatsAppLinks();
  wireInstagramLinks();
  updateOpenStatus();
  setupMobileNav();
  setupHeaderScroll();
  setupBackToTop();
  setupRevealOnScroll();
  setupScrollProgress();
  setupCountUp();
  setupScrollShow();
  setupImageFallback();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setInterval(updateOpenStatus, 60000);
});
