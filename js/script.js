// ---- 1. Selector de Tema Claro / Oscuro (con Persistencia y S.O.) ----
(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    localStorage.setItem('theme', t); // Guarda la elección del usuario
    themeToggle.setAttribute(
      'aria-label',
      t === 'claro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'
    );
  }

  // Detección inicial: usa preferencia guardada o la del S.O.
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemPrefersDark) {
    setTheme('oscuro');
  }

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'claro' ? 'oscuro' : 'claro');
  });
})();

// ---- 2. Menú Hamburguesa (Mobile) ----
(function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  if (!hamburgerBtn || !navLinks) return;

  function cerrarMenu() {
    navLinks.classList.remove('open');
    hamburgerBtn.classList.remove('open');
  }

  hamburgerBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburgerBtn.classList.toggle('open');
  });

  // Cierra el menú al tocar cualquier opción de navegación
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', cerrarMenu));
})();

// ---- 2b. Slider principal (hero) ----
(function () {
  const root = document.getElementById('heroSlider');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.slide'));
  const dotsWrap = root.querySelector('.slider-dots');
  const prevBtn = root.querySelector('.slider-btn.prev');
  const nextBtn = root.querySelector('.slider-btn.next');
  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;
  let timer;

  // Si el archivo de foto existe (data-bg), la usa como fondo; si no, queda el degradé.
  slides.forEach((slide) => {
    const bg = slide.getAttribute('data-bg');
    if (!bg) return;
    const test = new Image();
    test.onload = () => { slide.style.backgroundImage = `url('${bg}')`; };
    test.src = bg;
  });

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    if (i === current) dot.classList.add('is-active');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    restart();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5500);
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);

  restart();
})();

// ---- 3. Acordeón de FAQ ----
(function () {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });
})();

// ---- 3b. Botón "Volver arriba" (hasta el índice) ----
(function () {
  const btn = document.getElementById('backToTop');
  const toc = document.getElementById('toc');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    (toc || document.body).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

// ---- 3c. Carruseles de fotos por sección ----
(function () {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach((car) => {
    const track = car.querySelector('.carousel-track');
    const prev = car.querySelector('.carousel-btn.prev');
    const next = car.querySelector('.carousel-btn.next');
    const counter = car.querySelector('.carousel-counter .current');
    const slides = car.querySelectorAll('.carousel-slide');
    if (!track || slides.length === 0) return;

    function goTo(index) {
      const wrapped = (index + slides.length) % slides.length;
      track.scrollTo({ left: wrapped * track.clientWidth, behavior: 'smooth' });
    }

    prev && prev.addEventListener('click', () => {
      goTo(Math.round(track.scrollLeft / track.clientWidth) - 1);
    });
    next && next.addEventListener('click', () => {
      goTo(Math.round(track.scrollLeft / track.clientWidth) + 1);
    });

    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        if (counter) counter.textContent = idx + 1;
      }, 80);
    });

    // Avance automático: pasa de foto solo cada 4s, se pausa al pasar el mouse
    // o mientras el carrusel no está visible en pantalla.
    if (slides.length > 1) {
      let timer;
      let visible = false;

      function start() {
        clearInterval(timer);
        timer = setInterval(() => {
          goTo(Math.round(track.scrollLeft / track.clientWidth) + 1);
        }, 4000);
      }
      function stop() { clearInterval(timer); }

      car.addEventListener('mouseenter', stop);
      car.addEventListener('mouseleave', () => { if (visible) start(); });
      car.addEventListener('touchstart', stop, { passive: true });

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) start(); else stop();
        });
      }, { threshold: 0.35 });
      io.observe(car);
    }
  });
})();

// ---- 4. Formulario de Contacto (Mockup) ----
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Formulario de ejemplo — falta conectar con el envío real de email.');
  });
})();

// ---- 5. WhatsApp con Saludo Dinámico según la Hora ----
(function () {
  const phone = "541132435842"; // Tu número con código de país (sin + ni espacios)

  function obtenerSaludo() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) {
      return "Hola, buenos días";
    } else if (hora >= 12 && hora < 20) {
      return "Hola, buenas tardes";
    } else {
      return "Hola, buenas noches";
    }
  }

  // Se asigna a window para poder llamarla desde cualquier HTML con un onclick
  window.abrirWhatsApp = function (consulta = "queria consultar sobre imanes") {
    const saludo = obtenerSaludo();
    const texto = `${saludo}, ${consulta}.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(texto)}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };
})();