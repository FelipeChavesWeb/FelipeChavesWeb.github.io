(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  const dialog = document.querySelector('#demo-dialog');
  const detail = document.querySelector('#dialog-detail');
  const messages = {
    consultation: 'On a real website, this would connect to the office’s approved email or scheduling destination. No personal information is collected here.',
    phone: '(210) 555-0142 is a fictional demonstration number. No call will be placed. A real office number would be directly callable on mobile.',
    email: 'hello@stillgrove.example is a non-deliverable placeholder. No email app will open and no message will be sent.'
  };
  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => { detail.textContent = messages[button.dataset.demo]; dialog.showModal(); }));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
})();

/* ================= MICROINTERAÇÕES ================= */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Header: sombra sutil ao rolar a página.
  const header = document.querySelector('.header');
  const onScrollHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  // 2) Scrollspy: destaca o link do menu correspondente à seção visível.
  const navLinks = document.querySelectorAll('#primary-nav a[href^="#"]:not(.nav-cta)');
  const sections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = document.querySelector(`#primary-nav a[href="#${entry.target.id}"]`);
        if (link) link.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => spy.observe(section));
  }

  // 3) Entrada suave ao rolar. A classe "reveal-ready" só é adicionada aqui: sem JS, ou com
  //    IntersectionObserver indisponível, ou com prefers-reduced-motion, o conteúdo permanece
  //    visível por padrão (a regra correspondente no CSS depende dessa classe).
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if (!reduceMotion && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('reveal-ready');
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => reveal.observe(el));
    }
  }

  // 4) FAQ: abertura/fechamento suave via Web Animations API nativa (sem libs).
  //    Com prefers-reduced-motion, mantém o comportamento nativo instantâneo do <details>.
  if (!reduceMotion && typeof HTMLElement.prototype.animate === 'function') {
    document.querySelectorAll('.faq-list details').forEach(details => {
      const summary = details.querySelector('summary');
      let running = false;
      summary.addEventListener('click', event => {
        event.preventDefault();
        if (running) return;
        details.open ? closeDetails() : openDetails();
      });
      function openDetails() {
        details.style.height = `${details.offsetHeight}px`;
        details.open = true;
        running = true;
        requestAnimationFrame(() => {
          const endHeight = details.scrollHeight;
          details.animate({ height: [`${summary.offsetHeight}px`, `${endHeight}px`] }, { duration: 260, easing: 'cubic-bezier(.22,.61,.36,1)' })
            .onfinish = () => { details.style.height = ''; running = false; };
        });
      }
      function closeDetails() {
        running = true;
        const startHeight = details.offsetHeight;
        details.animate({ height: [`${startHeight}px`, `${summary.offsetHeight}px`] }, { duration: 220, easing: 'cubic-bezier(.22,.61,.36,1)' })
          .onfinish = () => { details.open = false; details.style.height = ''; running = false; };
      }
    });
  }
})();
