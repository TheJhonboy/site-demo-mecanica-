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

  // Movimento estimado por hora, no estilo "horários de pico" do Google.
  // 0 = domingo ... 6 = sábado; null = fechado. Cada número é 0–100 e
  // corresponde a uma hora, começando na primeira hora de businessHours.
  // São valores FICTÍCIOS — troque pelo movimento real da oficina.
  popularTimes: {
    0: null,
    1: [88, 96, 90, 72, 38, 44, 68, 78, 74, 58, 34],
    2: [62, 74, 70, 58, 30, 36, 55, 62, 58, 46, 26],
    3: [55, 66, 63, 52, 28, 33, 50, 58, 54, 42, 24],
    4: [58, 70, 68, 55, 30, 35, 54, 63, 60, 48, 28],
    5: [76, 88, 84, 68, 36, 42, 66, 80, 86, 70, 40],
    6: [92, 100, 94, 76, 52, 30],
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
   Vídeo de fundo da primeira tela
   ---------------------------------------------------------
   O vídeo roda sozinho em loop, sem depender de rolagem. As frases trocam
   acompanhando o tempo do vídeo (não um timer solto), então a volta do loop
   e a volta das frases coincidem.

   Por que <video> e não uma sequência de quadros num canvas: o navegador
   decodifica vídeo em hardware, o arquivo é um só (3,5MB contra 6MB de 120
   JPEGs) e o loop é contínuo de verdade. A sequência de quadros só se paga
   quando o dedo precisa controlar a posição, que não é mais o caso aqui.
   ========================================================= */
function setupHeroVideo(objectUrl) {
  const section = document.getElementById("vhero");
  const video = document.getElementById("vheroVideo");
  if (!section || !video) return;

  // O vídeo de trás só existe para preencher as laterais no computador,
  // desfocado. Numa tela vertical ele não aparece — e aí fica pausado, para não
  // gastar bateria decodificando um vídeo que ninguém vê.
  const fundo = document.getElementById("vheroFundo");
  const deitada = window.matchMedia("(orientation: landscape)");
  const ajustarFundo = () => {
    if (!fundo) return;
    if (!deitada.matches) return fundo.pause();
    if (!video.paused && fundo.paused) fundo.play().catch(() => {});
  };
  if (deitada.addEventListener) deitada.addEventListener("change", ajustarFundo);

  const lines = Array.from(section.querySelectorAll(".vhero__line"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active = 0;

  const show = (i) => {
    if (i === active) return;
    active = i;
    lines.forEach((el, k) => el.classList.toggle("is-on", k === i));
  };

  // A frase dominante é a última cujo data-at o vídeo já passou.
  const syncLines = () => {
    const d = video.duration;
    if (!d || !isFinite(d)) return;
    const p = video.currentTime / d;
    let want = 0;
    for (let i = 0; i < lines.length; i++) {
      if (p >= parseFloat(lines[i].dataset.at || "0")) want = i;
    }
    show(want);
  };

  if (reduced) {
    // Sem movimento: os dois ficam no poster, com a primeira frase.
    video.removeAttribute("autoplay");
    video.load();
    if (fundo) { fundo.removeAttribute("autoplay"); fundo.load(); }
    return;
  }

  video.src = objectUrl || pickVideoSource();
  if (fundo) fundo.src = video.src;
  video.addEventListener("timeupdate", syncLines);

  // Enquanto o vídeo não estiver tocando, as frases giram no relógio — assim a
  // primeira tela nunca fica completamente muda. Quando o vídeo pega, o
  // relógio sai de cena e quem manda nas frases volta a ser o tempo do vídeo.
  let rotator = null;
  const startRotator = () => {
    if (rotator) return;
    let i = active;
    rotator = setInterval(() => {
      i = (i + 1) % lines.length;
      show(i);
    }, 4200);
  };
  const stopRotator = () => {
    if (!rotator) return;
    clearInterval(rotator);
    rotator = null;
  };

  // Uma checagem só, disparada por qualquer mudança de estado do vídeo: se ele
  // não está de fato correndo (recusado, pausado, engasgado na rede), o relógio
  // assume; assim que volta a correr, o relógio sai. Amarrar isso a um único
  // evento não basta — um "playing" solto chega a desligar o relógio mesmo com
  // o vídeo parado logo em seguida, e a tela congela de vez.
  const decidirRelogio = () => {
    if (video.paused || video.readyState < 3) startRotator();
    else stopRotator();
  };
  ["playing", "play", "pause", "waiting", "stalled", "ended", "error"].forEach(
    (e) => video.addEventListener(e, decidirRelogio)
  );

  // O fundo segue a frente: mesmo estado e mesmo ponto do loop. Se a distância
  // passar de meio segundo (os dois decodificam separados e podem se afastar),
  // ele é recolocado no lugar — desfocado ninguém nota o salto.
  if (fundo) {
    video.addEventListener("play", ajustarFundo);
    video.addEventListener("pause", () => fundo.pause());
    video.addEventListener("timeupdate", () => {
      if (fundo.paused) return;
      if (Math.abs(fundo.currentTime - video.currentTime) > 0.5) {
        fundo.currentTime = video.currentTime;
      }
    });
  }

  // Safari no modo de baixo consumo, economia de dados e algumas políticas de
  // energia recusam o autoplay mesmo com o vídeo mudo. Nesse caso o poster fica
  // parado na tela — que é justamente a impressão de "site travado". A saída é
  // tentar de novo no primeiro gesto da pessoa: qualquer toque, rolagem ou
  // tecla libera o play, e é o próprio navegador que exige esse gesto.
  const GESTOS = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"];
  let armado = false;
  const desarmar = () => {
    if (!armado) return;
    armado = false;
    GESTOS.forEach((g) => document.removeEventListener(g, aoGesto));
  };
  const aoGesto = () => { desarmar(); play(); };
  const armar = () => {
    if (armado) return;
    armado = true;
    GESTOS.forEach((g) =>
      document.addEventListener(g, aoGesto, { once: true, passive: true })
    );
  };

  const play = () => {
    const r = video.play();
    if (r && r.then) {
      r.then(() => { desarmar(); decidirRelogio(); }).catch(() => {
        startRotator();
        armar();
      });
    }
  };
  if (video.readyState >= 2) play();
  else video.addEventListener("loadeddata", play, { once: true });

  // Aba escondida: o navegador já pausa sozinho, mas garantir a volta evita
  // o vídeo ficar congelado quando a pessoa retorna.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && video.paused) play();
  });
}

/* =========================================================
   Loader — progresso real do download do vídeo
   ---------------------------------------------------------
   A barra reflete quantos bytes do vídeo já chegaram, não um timer falso: o
   arquivo é baixado com fetch em pedaços e vira um blob que o <video> consome
   já pronto — assim a primeira tela nunca começa engasgando. Se o navegador
   não tiver streaming, ou algo falhar, o vídeo carrega do jeito normal.
   Um prazo de 8s revela o site de qualquer forma: ninguém pode ficar preso na
   tela de carregamento por causa de um arquivo.
   ========================================================= */
// MP4/H.264 primeiro: é decodificado em hardware em praticamente todo aparelho,
// o que pesa menos na bateria do celular. O WebM/VP9 cobre os navegadores sem
// H.264 (algumas builds de Chromium e Firefox no Linux) e é menor.
const VHERO_SOURCES = [
  { src: "assets/video/oficina.mp4", type: 'video/mp4; codecs="avc1.42E01E"' },
  { src: "assets/video/oficina.webm", type: 'video/webm; codecs="vp9"' },
];

function pickVideoSource() {
  const probe = document.createElement("video");
  for (const s of VHERO_SOURCES) {
    if (probe.canPlayType(s.type)) return s.src;
  }
  return VHERO_SOURCES[0].src;
}

function setupLoader(onReady) {
  const loader = document.getElementById("loader");
  const bar = document.getElementById("loaderBar");
  const pct = document.getElementById("loaderPct");
  let revealed = false;

  const paint = (ratio) => {
    const r = Math.max(0, Math.min(1, ratio));
    if (bar) bar.style.transform = `scaleX(${r.toFixed(4)})`;
    if (pct) pct.textContent = `${Math.round(r * 100)}%`;
  };

  const reveal = (objectUrl) => {
    if (revealed) return;
    revealed = true;
    paint(1);
    document.body.classList.remove("is-loading");
    if (loader) {
      loader.classList.add("is-done");
      setTimeout(() => loader.remove(), 600);
    }
    onReady(objectUrl);
  };

  paint(0);
  setTimeout(() => reveal(null), 8000);

  const download = async () => {
    if (!window.fetch || !window.ReadableStream) return reveal(null);
    try {
      const res = await fetch(pickVideoSource());
      if (!res.ok || !res.body) return reveal(null);

      const total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        got += value.length;
        // Sem content-length (resposta comprimida em stream) a barra avança por
        // estimativa: melhor um progresso aproximado que uma barra parada.
        paint(total ? got / total : Math.min(0.95, got / 3.6e6));
      }
      if (revealed) return; // o prazo de 8s já revelou; o vídeo entra normal
      const tipo = res.headers.get("content-type") || "video/mp4";
      reveal(URL.createObjectURL(new Blob(chunks, { type: tipo })));
    } catch (e) {
      reveal(null);
    }
  };

  download();
}

/* =========================================================
   Movimento da semana — gráfico no estilo "horários de pico" do Google.
   Os dados vivem em CONFIG.popularTimes; aqui só desenhamos.
   ========================================================= */
function setupPopularTimes() {
  const root = document.getElementById("popular");
  const daysEl = document.getElementById("popularDays");
  const chartEl = document.getElementById("popularChart");
  const statusEl = document.getElementById("popularStatus");
  if (!root || !daysEl || !chartEl || !statusEl) return;

  const SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const ORDER = [1, 2, 3, 4, 5, 6, 0]; // a semana começa na segunda
  const now = new Date();
  const today = now.getDay();

  const level = (v) => (v >= 72 ? "full" : v >= 40 ? "busy" : "calm");
  const LABEL = { calm: "tranquilo", busy: "movimentado", full: "lotado" };
  const hourLabel = (h) => `${String(h).padStart(2, "0")}h`;

  const render = (day) => {
    const data = CONFIG.popularTimes[day];
    const hours = CONFIG.businessHours[day];
    chartEl.textContent = "";

    if (!data || !hours) {
      chartEl.classList.add("is-closed");
      const p = document.createElement("p");
      p.className = "popular__closed";
      p.textContent = "Fechado";
      chartEl.appendChild(p);
      statusEl.innerHTML = `<strong>${FULL[day]}</strong>: a oficina não abre.`;
      return;
    }
    chartEl.classList.remove("is-closed");

    const peak = data.indexOf(Math.max.apply(null, data));
    const calm = data.indexOf(Math.min.apply(null, data));
    const nowIdx = day === today ? now.getHours() - hours[0] : -1;

    data.forEach((v, i) => {
      const h = hours[0] + i;
      const col = document.createElement("div");
      col.className = `popular__bar is-${level(v)}`;
      if (i === nowIdx) col.classList.add("is-now");
      col.title = `${hourLabel(h)} — ${LABEL[level(v)]}`;

      const fill = document.createElement("span");
      fill.style.height = `${Math.max(8, v)}%`;
      fill.style.animationDelay = `${i * 35}ms`;
      col.appendChild(fill);

      // rótulo de 2 em 2 horas: no celular todos não cabem
      if (i % 2 === 0 || i === data.length - 1) {
        const lab = document.createElement("small");
        lab.textContent = hourLabel(h);
        col.appendChild(lab);
      }
      chartEl.appendChild(col);
    });

    const peakH = hourLabel(hours[0] + peak);
    const calmH = hourLabel(hours[0] + calm);
    const nowLevel = nowIdx >= 0 && nowIdx < data.length ? level(data[nowIdx]) : null;
    statusEl.innerHTML =
      nowLevel === "calm"
        ? `Agora costuma ficar <strong>tranquilo</strong> — boa hora pra passar aqui.`
        : nowLevel
        ? `Agora costuma ficar <strong>${LABEL[nowLevel]}</strong>. Mais tranquilo às ${calmH}.`
        : `<strong>${FULL[day]}</strong>: mais cheio às ${peakH}, mais tranquilo às ${calmH}.`;
  };

  ORDER.forEach((d) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "popular__day";
    b.textContent = SHORT[d];
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", "false");
    b.setAttribute("aria-label", FULL[d]);
    if (d === today) b.classList.add("is-today");
    b.addEventListener("click", () => {
      daysEl.querySelectorAll(".popular__day").forEach((x) => {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      render(d);
    });
    daysEl.appendChild(b);
  });

  // abre no dia de hoje
  const start = daysEl.children[ORDER.indexOf(today)];
  if (start) start.click();
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
  // O total sai da contagem real de imagens: trocar a galeria no HTML não pode
  // deixar um "/ 10" velho para trás.
  const totalEl = document.getElementById("scrollshowTotal");
  if (totalEl) totalEl.textContent = String(frames.length);
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

// O loader arranca já, sem esperar DOMContentLoaded: este script está no fim
// do body, então os elementos existem, e qualquer recurso externo lento (a
// fonte, por exemplo) atrasaria o início do download dos quadros — e junto o
// timeout de segurança, deixando o visitante olhando a tela de carregamento
// por muito mais tempo do que os 8s previstos.
setupLoader((videoUrl) => setupHeroVideo(videoUrl));

/* =========================================================
   Onda do clique no botão de fechamento
   ---------------------------------------------------------
   A onda nasce no ponto exato onde o dedo encostou, cresce e some. É criada e
   removida a cada clique em vez de ficar no DOM: um elemento a menos parado na
   página, e nunca sobra estado de um clique anterior. Quem pediu menos
   movimento no sistema não recebe nada disso.
   ========================================================= */
function setupBotaoOnda() {
  const botoes = document.querySelectorAll(".btn--pulse");
  if (!botoes.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  botoes.forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 2;
      const onda = document.createElement("span");
      onda.className = "btn__onda";
      onda.style.width = onda.style.height = d + "px";
      onda.style.left = e.clientX - r.left - d / 2 + "px";
      onda.style.top = e.clientY - r.top - d / 2 + "px";
      btn.appendChild(onda);
      onda.addEventListener("animationend", () => onda.remove(), { once: true });
    });
  });
}

const boot = () => {
  wireWhatsAppLinks();
  wireInstagramLinks();
  updateOpenStatus();
  setupMobileNav();
  setupChromeOnScroll();
  setupRevealOnScroll();
  setupCountUp();
  setupScrollShow();
  setupPopularTimes();
  setupBotaoOnda();
  setupImageFallback();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  setInterval(updateOpenStatus, 60000);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
