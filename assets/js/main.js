/* ==========================================================================
   FLEXARION — script principal
   Aucune dépendance. Chargé en « defer » : le HTML reste lisible sans lui.

   1. Navigation mobile
   2. En-tête au défilement
   3. Apparition des blocs au défilement
   4. Vent solaire (canvas du héros)
   5. Visionneuse de la galerie
   6. Barre de progression de lecture
   7. Formulaire de contact
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Navigation mobile -------------------------------------------------- */
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('menu-principal');

  if (toggle && nav) {
    const label = toggle.querySelector('.sr-only');

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si l'on repasse en grand écran menu ouvert, on remet tout à plat.
    window.matchMedia('(min-width: 920px)').addEventListener('change', (mq) => {
      if (mq.matches) setOpen(false);
    });
  }

  /* 2. En-tête au défilement ---------------------------------------------- */
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 3. Apparition des blocs au défilement --------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* 4. Vent solaire --------------------------------------------------------
     Un champ de particules qui matérialise le « Maestral », le vent stellaire
     du jeu. Le vent contourne le curseur. L'animation se met en pause dès que
     le canvas sort de l'écran ou que l'onglet passe en arrière-plan. */
  const COLORS = ['255, 198, 112', '243, 234, 219', '240, 166, 60', '165, 150, 245'];

  const initWind = (canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const host = canvas.parentElement;
    const direction = canvas.dataset.wind === 'ltr' ? 1 : -1;
    const pointer = { x: -9999, y: -9999 };
    const RADIUS = 150;

    let width = 0;
    let height = 0;
    let particles = [];
    let time = 0;
    let frame = null;
    let onScreen = true;

    const spawn = (particle = {}, anywhere = true) => {
      particle.x = anywhere ? Math.random() * width : (direction === 1 ? -20 : width + 20);
      particle.y = Math.random() * height;
      particle.speed = 1.2 + Math.random() * 3.2;
      particle.width = 0.6 + Math.random() * 1.4;
      particle.life = 80 + Math.random() * 220;
      particle.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      particle.alpha = 0.25 + Math.random() * 0.55;
      return particle;
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = 'round';
      const count = Math.round(Math.min(240, Math.max(50, (width * height) / 6500)));
      particles = Array.from({ length: count }, () => spawn());
    };

    const step = (fade) => {
      if (fade) {
        // On efface progressivement : le canvas reste transparent.
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.globalCompositeOperation = 'lighter';

      const gust = 1 + 0.4 * Math.sin(time * 0.0007); // les rafales

      for (const p of particles) {
        const angle = Math.sin(p.x * 0.0035 + time * 0.00025) * 0.38
                    + Math.cos(p.y * 0.006 - time * 0.0002) * 0.3;
        let vx = direction * Math.cos(angle) * p.speed * gust;
        let vy = Math.sin(angle) * p.speed * gust;

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < RADIUS && distance > 0.01) {
          const force = (1 - distance / RADIUS) * 4;
          vx += (dx / distance) * force;
          vy += (dy / distance) * force;
        }

        const nx = p.x + vx;
        const ny = p.y + vy;

        ctx.strokeStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.lineWidth = p.width;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.life -= 1;

        if (p.life <= 0 || nx < -30 || nx > width + 30 || ny < -30 || ny > height + 30) {
          spawn(p, p.life <= 0);
        }
      }
      time += 16;
    };

    const loop = () => {
      step(true);
      frame = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame === null && onScreen && !document.hidden && !reduceMotion) {
        frame = window.requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
    };

    const drawStill = () => {
      // Mouvement réduit : une image fixe, obtenue en laissant filer quelques pas.
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < 26; i += 1) step(false);
    };

    resize();
    if (reduceMotion) drawStill(); else start();

    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduceMotion) drawStill();
      }, 150);
    });

    host.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });
    host.addEventListener('pointerleave', () => {
      pointer.x = -9999;
      pointer.y = -9999;
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start(); else stop();
      }).observe(canvas);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });
  };

  document.querySelectorAll('canvas[data-wind]').forEach(initWind);

  /* 5. Visionneuse de la galerie ------------------------------------------
     Sans JavaScript, le lien ouvre simplement l'image en grand. */
  const lightboxLinks = document.querySelectorAll('a[data-lightbox]');

  if (lightboxLinks.length && 'HTMLDialogElement' in window) {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image agrandie');
    dialog.innerHTML = `
      <form method="dialog"><button class="lightbox__close" aria-label="Fermer l'image">×</button></form>
      <figure><img alt=""><figcaption></figcaption></figure>`;
    document.body.append(dialog);

    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('figcaption');

    lightboxLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const thumb = link.querySelector('img');
        image.src = link.href;
        image.alt = thumb ? thumb.alt : '';
        caption.textContent = link.dataset.caption || '';
        dialog.showModal();
      });
    });

    // Un clic sur le fond referme la visionneuse.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  /* 6. Barre de progression de lecture ------------------------------------ */
  const progress = document.querySelector('[data-progress]');
  const article = document.querySelector('[data-article]');

  if (progress && article) {
    let ticking = false;

    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      progress.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* 7. Formulaire de contact ------------------------------------------------
     Le site est statique : après validation, on prépare un e-mail dans la
     messagerie du visiteur. Pour un envoi direct, il suffit de remplacer ce
     bloc par un appel à un service de formulaires (Formspree, Netlify Forms…). */
  const form = document.querySelector('[data-contact-form]');

  if (form) {
    const status = form.querySelector('[data-form-status]');
    const fields = Array.from(form.querySelectorAll('[data-field]'));
    form.setAttribute('novalidate', '');

    const validate = (field) => {
      const input = field.querySelector('input, select, textarea');
      const valid = input.checkValidity();
      field.classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      return valid;
    };

    fields.forEach((field) => {
      const input = field.querySelector('input, select, textarea');
      input.addEventListener('blur', () => validate(field));
      input.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validate(field);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const invalid = fields.filter((field) => !validate(field));
      const consent = form.querySelector('[name="consentement"]');

      if (invalid.length || (consent && !consent.checked)) {
        status.textContent = invalid.length
          ? 'Quelques champs sont à corriger avant l\'envoi.'
          : 'Merci de cocher la case de consentement.';
        status.classList.add('is-error');
        (invalid.length ? invalid[0].querySelector('input, select, textarea') : consent).focus();
        return;
      }

      const data = new FormData(form);
      const subject = `[${data.get('profil')}] ${data.get('sujet')}`;
      const body = `Nom : ${data.get('nom')}\nE-mail : ${data.get('email')}\nProfil : ${data.get('profil')}\n\n${data.get('message')}`;

      window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      status.classList.remove('is-error');
      status.textContent = 'Votre messagerie s\'ouvre avec le message prêt à partir. Il ne reste qu\'à l\'envoyer !';
    });
  }
})();
