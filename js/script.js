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