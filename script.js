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
      if (label) {
        const lang = window.__portfolioLanguage || 'en';
        label.textContent = lang === 'pt'
          ? (nextState ? 'Ver antes' : 'Ver depois')
          : (nextState ? 'View before' : 'View after');
      }
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
      {
        const lang = window.__portfolioLanguage || 'en';
        themeToggle.setAttribute(
          'aria-label',
          lang === 'pt'
            ? (theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro')
            : (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
        );
      }
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


// --- BILINGUAL PORTFOLIO (PT-BR / EN) ---
(() => {
  const translations = {
    pt: {
      "Skip to content": "Pular para o conteúdo",
      "Work": "Projetos",
      "Process": "Processo",
      "About": "Sobre",
      "Contact": "Contato",
      "Email me": "Fale por email",
      "View projects": "Ver projetos",
      "Web Design & Development": "Web Design & Desenvolvimento",
      "A website that reflects": "Um site que reflete",
      "the quality of your work.": "a qualidade do seu trabalho.",
      "I design and build clear, polished websites for small businesses that need a stronger, more professional online presence.": "Eu crio sites claros e bem acabados para pequenos negócios que precisam de uma presença online mais forte e profissional.",
      "Independent Web Designer & Developer • Based in Brazil • Remote": "Web Designer & Developer independente • Brasil • Remoto",
      "View before": "Ver antes",
      "View after": "Ver depois",
      "Portfolio": "Portfólio",
      "Selected work": "Projetos selecionados",
      "Selected concept work focused on clarity, performance, and thoughtful user experience.": "Projetos conceituais selecionados, com foco em clareza, performance e uma experiência de uso bem pensada.",
      "Law firm website concept": "Conceito de site para escritório de advocacia",
      "A calm, focused website concept designed to communicate trust, clarity, and professionalism for an estate planning practice.": "Um conceito de site sóbrio e objetivo, criado para transmitir confiança, clareza e profissionalismo para um escritório de planejamento sucessório.",
      "One page": "One page",
      "Copywriting": "Copywriting",
      "Microinteractions": "Microinterações",
      "View project": "Ver projeto",
      "Stone & marble business concept": "Conceito para marmoraria",
      "Local café concept": "Conceito para cafeteria local",
      "Process": "Processo",
      "How it works": "Como funciona",
      "Discovery": "Descoberta",
      "We align on your goals, audience, and content before designing the first screen.": "Alinhamos seus objetivos, público e conteúdo antes de desenhar a primeira tela.",
      "Design": "Design",
      "A clear visual direction is developed and approved before the build begins.": "Uma direção visual clara é desenvolvida e aprovada antes do desenvolvimento.",
      "Build": "Desenvolvimento",
      "Clean, lightweight code built for speed and a smooth experience across devices.": "Código limpo e leve, pensado para velocidade e uma boa experiência em diferentes dispositivos.",
      "Launch": "Publicação",
      "Publishing, domain connection, and final checks to get the site live.": "Publicação, conexão do domínio e verificações finais para colocar o site no ar.",
      "About": "Sobre",
      "Clear design. Professional presence.": "Design claro. Presença profissional.",
      "I’m Felipe Chaves, an independent web designer and developer based in Brazil. I work directly with small businesses and professionals to create clear, polished websites that communicate value from the first interaction.": "Sou Felipe Chaves, web designer e developer independente no Brasil. Trabalho diretamente com pequenos negócios e profissionais para criar sites claros e bem acabados que comunicam valor desde o primeiro contato.",
      "Start a project": "Comece um projeto",
      "Need a better online": "Precisa de uma presença online",
      "presence?": "melhor?",
      "All rights reserved.": "Todos os direitos reservados.",
      "Back to top ↑": "Voltar ao topo ↑",
      "Stonework with": "Marmoraria com",
      "intention.": "intenção.",
      "A warmer place": "Um lugar mais acolhedor",
      "for coffee.": "para o café."
    }
  };

  const EN_TITLE = "Felipe Chaves — Web Designer & Developer";
  const PT_TITLE = "Felipe Chaves — Web Designer & Developer";
  const EN_DESCRIPTION = "Felipe Chaves designs and builds clear, polished websites for small businesses.";
  const PT_DESCRIPTION = "Felipe Chaves cria sites claros e bem acabados para pequenos negócios e profissionais.";

  // Save original English text/attributes once.
  const textNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && !["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (trimmed) {
        textNodes.push({ node, original, trimmed });
      }
    }
  }

  const originalAttrs = new Map();
  document.querySelectorAll("[aria-label]").forEach(el => {
    originalAttrs.set(el, el.getAttribute("aria-label"));
  });

  const waLinks = [...document.querySelectorAll('a[href*="wa.me/"]')];
  const waEnglish = "Hi Felipe, I saw your portfolio and would like to talk about a website project.";
  const waPortuguese = "Oi Felipe, vi seu portfólio e gostaria de conversar sobre um projeto de site.";

  const attributePt = {
    "Felipe Chaves, home": "Felipe Chaves, início",
    "Main navigation": "Navegação principal",
    "Toggle theme": "Alternar tema",
    "Open navigation menu": "Abrir menu de navegação",
    "Demonstration: a website before and after a redesign": "Demonstração: um site antes e depois de um redesign",
    "View the Stillgrove concept": "Ver o conceito Stillgrove",
    "Language": "Idioma"
  };

  const translateTextNode = (entry, lang) => {
    if (lang === "en") {
      entry.node.nodeValue = entry.original;
      return;
    }
    const translated = translations.pt[entry.trimmed];
    if (!translated) {
      entry.node.nodeValue = entry.original;
      return;
    }
    const leading = entry.original.match(/^\s*/)?.[0] || "";
    const trailing = entry.original.match(/\s*$/)?.[0] || "";
    entry.node.nodeValue = leading + translated + trailing;
  };

  const applyLanguage = (lang, save = true) => {
    lang = lang === "pt" ? "pt" : "en";
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

    textNodes.forEach(entry => translateTextNode(entry, lang));

    originalAttrs.forEach((original, el) => {
      el.setAttribute("aria-label", lang === "pt" && attributePt[original] ? attributePt[original] : original);
    });

    document.title = lang === "pt" ? PT_TITLE : EN_TITLE;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", lang === "pt" ? PT_DESCRIPTION : EN_DESCRIPTION);

    // Theme label needs to reflect both language and current theme.
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      themeToggle.setAttribute(
        "aria-label",
        lang === "pt"
          ? (isDark ? "Mudar para tema claro" : "Mudar para tema escuro")
          : (isDark ? "Switch to light theme" : "Switch to dark theme")
      );
    }

    const mobileMenuToggle = document.getElementById("mobileMenuToggle");
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute("aria-label", lang === "pt" ? "Abrir menu de navegação" : "Open navigation menu");
    }

    waLinks.forEach(link => {
      const text = lang === "pt" ? waPortuguese : waEnglish;
      link.href = "https://wa.me/5511954970944?text=" + encodeURIComponent(text);
    });

    document.querySelectorAll("[data-lang-switch]").forEach(btn => {
      const active = btn.dataset.langSwitch === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    // The before/after toggle is dynamic, so refresh its label explicitly.
    const beforeAfterToggle = document.getElementById("beforeAfterToggle");
    const device = document.querySelector(".device");
    const label = beforeAfterToggle?.querySelector("[data-label]");
    if (label && device) {
      const afterState = device.dataset.state === "after";
      label.textContent = lang === "pt"
        ? (afterState ? "Ver antes" : "Ver depois")
        : (afterState ? "View before" : "View after");
    }

    if (save) localStorage.setItem("portfolioLanguage", lang);
    window.__portfolioLanguage = lang;
  };

  const url = new URL(window.location.href);
  const queryLang = url.searchParams.get("lang");
  const saved = localStorage.getItem("portfolioLanguage");
  const browserLang = (navigator.language || "").toLowerCase();
  const initial = (queryLang === "pt" || queryLang === "en")
    ? queryLang
    : (saved === "pt" || saved === "en")
      ? saved
      : browserLang.startsWith("pt") ? "pt" : "en";

  // Query parameter is treated as an explicit choice and therefore saved.
  applyLanguage(initial, true);

  document.querySelectorAll("[data-lang-switch]").forEach(btn => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.langSwitch, true));
  });

  // Expose for the existing before/after handler.
  window.__applyPortfolioLanguage = applyLanguage;
})();
