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

/* One scroll listener for the whole chrome (progress bar, header shadow,
   back-to-top), coalesced into a single animation frame. Three separate
   listeners each doing their own DOM writes is three chances to stall a
   frame while the user is scrolling. */
function setupChromeOnScroll() {
  const bar = document.getElementById("scrollProgress");
  const header = document.getElementById("header");
  const btn = document.getElementById("backToTop");

  if (btn) btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // scrollHeight is a layout read — cache it and refresh only on resize.
  let scrollable = 1;
  const measure = () => {
    scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  let queued = false;
  const paint = () => {
    queued = false;
    const y = window.scrollY;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, y / scrollable)).toFixed(4)})`;
    if (header) header.classList.toggle("is-scrolled", y > 10);
    if (btn) btn.classList.toggle("is-visible", y > 500);
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
  window.addEventListener("load", measure);

  measure();
  paint();
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

/* =========================================================
   Scroll motion — scroll-scrubbed frame sequence
   ---------------------------------------------------------
   Rolar a página "passa o vídeo": as fotos são as frames e o dedo/roda
   controla a posição, como um scrub de vídeo.

   Como isso se mantém em 60fps (ou 120, se a tela for 120Hz):
   - O listener de scroll só grava um número. Todo o desenho acontece dentro
     de um único requestAnimationFrame, então nunca renderizamos duas vezes
     no mesmo frame nem seguramos a thread durante o scroll.
   - Só mexemos em `transform` e `opacity` — as duas propriedades que o
     browser resolve no compositor, sem layout nem repaint.
   - Medidas de geometria (getBoundingClientRect) são feitas uma vez e
     cacheadas; ler layout dentro do loop causaria reflow forçado a cada frame.
   - Apenas as duas frames em transição ficam visíveis/promovidas; as outras
     saem com visibility:hidden pra não ocupar memória de GPU no celular.
   - As imagens são decodificadas antes da seção entrar em tela, senão o
     primeiro scrub engasga esperando decode.
   - O loop dorme quando a seção sai de vista ou quando o movimento assenta.
   ========================================================= */
function setupScrollShow() {
  const section = document.getElementById("scrollshow");
  const track = section && section.querySelector(".scrollshow__track");
  const frames = section ? Array.from(section.querySelectorAll(".scrollshow__img")) : [];
  if (!section || !track || frames.length < 2) return;

  const bar = document.getElementById("scrollshowBar");
  const indexEl = document.getElementById("scrollshowIndex");
  const titleEl = document.getElementById("scrollshowTitle");
  const textEl = document.getElementById("scrollshowText");
  const caption = section.querySelector(".scrollshow__caption");
  const hint = section.querySelector(".scrollshow__hint");

  section.style.setProperty("--frames", String(frames.length));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ZOOM = 0.06;

  // ---- geometry cache (never read inside the render loop) ----
  let startY = 0;
  let span = 1;
  const measure = () => {
    const rect = track.getBoundingClientRect();
    startY = rect.top + window.scrollY;
    span = Math.max(1, track.offsetHeight - window.innerHeight);
  };

  // ---- state ----
  let target = 0; // where the scroll says we are
  let eased = 0; // where we're actually drawing (smoothed)
  let looping = false;
  let inView = false;
  let livePair = [-1, -1];
  let lastLabel = -1;

  const readScroll = () => {
    target = clamp01((window.scrollY - startY) / span);
  };

  const setLive = (i, j) => {
    if (livePair[0] === i && livePair[1] === j) return;
    for (const k of livePair) {
      if (k >= 0 && k !== i && k !== j && frames[k]) frames[k].classList.remove("is-live");
    }
    if (frames[i]) frames[i].classList.add("is-live");
    if (frames[j]) frames[j].classList.add("is-live");
    livePair = [i, j];
  };

  const render = () => {
    const p = eased;
    const scaled = p * (frames.length - 1);
    const i = Math.min(frames.length - 2, Math.floor(scaled));
    const t = scaled - i; // 0..1 within the current pair
    const next = i + 1;

    setLive(i, next);

    // Base frame stays fully opaque and the incoming one fades in on top, so
    // the blend never dips through a washed-out middle.
    frames[i].style.opacity = "1";
    frames[i].style.transform = `scale(${(1 + ZOOM * t).toFixed(4)})`;
    frames[next].style.opacity = t.toFixed(4);
    frames[next].style.transform = `scale(${(1 + ZOOM - ZOOM * t).toFixed(4)})`;

    if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;

    // Caption swaps at the midpoint of a crossfade and eases out while moving.
    const label = Math.round(scaled);
    const settle = Math.abs(scaled - label); // 0 settled .. 0.5 mid-transition
    if (caption) {
      caption.style.opacity = clamp01(1 - settle * 2.1).toFixed(3);
      caption.style.transform = `translate3d(0, ${(settle * 26).toFixed(2)}px, 0)`;
    }
    if (label !== lastLabel) {
      lastLabel = label;
      const active = frames[label];
      if (indexEl) indexEl.textContent = String(label + 1);
      if (titleEl) titleEl.textContent = active.getAttribute("data-title") || "";
      if (textEl) textEl.textContent = active.getAttribute("data-text") || "";
    }

    if (hint && p > 0.015) hint.classList.add("is-hidden");
  };

  // Light smoothing: enough to take the stutter out of coarse wheel steps,
  // small enough that it still tracks the finger 1:1 on a phone.
  const SMOOTH = 0.22;
  const tick = () => {
    const diff = target - eased;
    if (Math.abs(diff) < 0.0004) {
      eased = target;
      render();
      looping = false; // settled — stop burning frames
      return;
    }
    eased += diff * SMOOTH;
    render();
    requestAnimationFrame(tick);
  };

  const wake = () => {
    if (looping || !inView) return;
    looping = true;
    requestAnimationFrame(tick);
  };

  const onScroll = () => {
    if (!inView) return;
    readScroll();
    wake();
  };

  // ---- decode frames before they're needed ----
  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    frames.forEach((img) => {
      img.loading = "eager";
      if (typeof img.decode === "function") img.decode().catch(() => {});
    });
  };

  if (reduced.matches) {
    setLive(0, 1);
    frames[0].style.opacity = "1";
    frames[0].style.transform = "none";
    return;
  }

  // Only run while the section is anywhere near the viewport.
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) {
            warm();
            measure();
            readScroll();
            eased = target; // land on the right frame instead of sweeping to it
            wake();
          }
        });
      },
      { rootMargin: "100% 0px" }
    ).observe(section);
  } else {
    inView = true;
    warm();
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      readScroll();
      eased = target;
      wake();
    }, 120);
  };
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });

  measure();
  readScroll();
  eased = target;
  render();
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
  setupChromeOnScroll();
  setupRevealOnScroll();
  setupCountUp();
  setupScrollShow();
  setupImageFallback();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setInterval(updateOpenStatus, 60000);
});
