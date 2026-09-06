document.addEventListener('DOMContentLoaded', () => {

  // 1. Atualizar Ano Dinâmico
  const yearElement = document.getElementById('year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  // 2. Transição do Header ao Rolar
  const header = document.getElementById('site-header');
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // 3. Toggle do Mockup (Antes/Depois)
  const toggle = document.getElementById('beforeAfterToggle');
  const device = document.querySelector('.device');
  if (toggle && device) {
    const label = toggle.querySelector('[data-label]');
    toggle.addEventListener('click', () => {
      const isPressed = toggle.getAttribute('aria-pressed') === 'true';
      const nextState = !isPressed;
      toggle.setAttribute('aria-pressed', String(nextState));
      device.dataset.state = nextState ? 'after' : 'before';
      if (label) label.textContent = nextState ? 'View before' : 'View after';
    });
  }

  // 4. Scrollspy Refinado
  const sections = ['work', 'process', 'about'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = document.querySelectorAll('[data-nav]');

  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((sec) => spyObserver.observe(sec));
  }

  // 5. Alternador de Tema (Light/Dark)
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  const sunPath = 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36-1.41-1.41M7.05 7.05 5.64 5.64m12.72 0-1.41 1.41M7.05 16.95l-1.41 1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
  const moonPath = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';

  const applyTheme = (theme) => {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      const path = themeToggle.querySelector('.theme-toggle-icon path');
      if (path) path.setAttribute('d', theme === 'dark' ? sunPath : moonPath);
    }
  };

  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  // 6. Scroll Reveal com Suporte a prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window && revealElements.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // 7. Efeito Spotlight nos Cards
  const cards = document.querySelectorAll('.spotlight-card');
  if (!prefersReducedMotion) {
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 8. Cursor Customizado Otimizado
  const cursorDot = document.getElementById('customCursor');
  const isPointerFine = window.matchMedia('(pointer: fine)').matches;

  if (cursorDot && isPointerFine && !prefersReducedMotion) {
    let cursorRing = document.getElementById('customCursorRing');
    if (!cursorRing) {
      cursorRing = document.createElement('div');
      cursorRing.id = 'customCursorRing';
      cursorRing.className = 'custom-cursor-ring';
      cursorRing.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cursorRing);
    }

    document.body.classList.add('has-custom-cursor');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      if (!isMoving) {
        isMoving = true;
        ringX = mouseX;
        ringY = mouseY;
        document.body.classList.add('cursor-ready');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(animateRing);
    };
    requestAnimationFrame(animateRing);

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
    document.addEventListener('mouseenter', () => { if (isMoving) document.body.classList.add('cursor-ready'); });

    const interactiveSelectors = 'a, button, input, textarea, [role="button"], .spotlight-card';
    document.querySelectorAll(interactiveSelectors).forEach((el) => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hovering'));
    });
  } else {
    document.body.classList.remove('has-custom-cursor', 'cursor-ready');
  }

});

document.addEventListener('DOMContentLoaded', () => {
  // --- MENU MÓVEL (HAMBÚRGUER) ---
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileMenuToggle && mainNav) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('open');
    });

    // Fechar o menu ao clicar em qualquer link de navegação
    mainNav.querySelectorAll('a:not(.dropdown-item)').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('open');
      });
    });
  }

  // --- DROPDOWN DE CONTATO ---
  const contactBtn = document.getElementById('contactBtn');
  const contactDropdown = document.getElementById('contactDropdown');

  if (contactBtn && contactDropdown) {
    contactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = contactDropdown.classList.contains('active');
      contactDropdown.classList.toggle('active');
      contactBtn.setAttribute('aria-expanded', !isOpen);
    });

    // Fechar o dropdown ao clicar fora dele
    document.addEventListener('click', (e) => {
      if (!contactDropdown.contains(e.target) && !contactBtn.contains(e.target)) {
        contactDropdown.classList.remove('active');
        contactBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});