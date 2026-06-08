/* =============================================
   Portfolio — Davide D'Ignazio
   Main script: navbar, reveals, parallax,
   lightbox, scroll progress, scroll-top,
   copy-to-clipboard, count-up, stagger
   ============================================= */

// ── NAVBAR ──────────────────────────────────────
const navbar    = document.querySelector('.portfolio-navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelectorAll('.portfolio-nav-links a');

window.addEventListener('scroll', () => {
    navbar?.classList.toggle('navbar-scrolled', window.scrollY > 32);
}, { passive: true });
navbar?.classList.toggle('navbar-scrolled', window.scrollY > 32);

navToggle?.addEventListener('click', () => {
    const open = navbar?.classList.toggle('menu-open');
    navToggle.setAttribute('aria-expanded', String(Boolean(open)));
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar?.classList.remove('menu-open');
        navToggle?.setAttribute('aria-expanded', 'false');
    });
});

// ── SCROLL PROGRESS BAR ─────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ── SCROLL-TO-TOP FAB ───────────────────────────
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.setAttribute('aria-label', 'Torna in cima');
scrollTopBtn.innerHTML = '<img src="./assets/icons/arrow-right-dark.svg" alt="" aria-hidden="true">';
document.body.appendChild(scrollTopBtn);

scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 420);
}, { passive: true });

// ── REVEAL ON SCROLL ─────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-up, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
});

// ── ACTIVE NAV LINK ──────────────────────────────
const sections = document.querySelectorAll('section[id]');

const setActiveNav = () => {
    let current = '';
    sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 150) current = s.id;
    });
    navLinks.forEach(link => {
        const href = link.getAttribute('href') ?? '';
        link.classList.toggle(
            'active',
            href === `#${current}` || href === `./index.html#${current}`
        );
    });
};
window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

// ── HERO VISUAL PARALLAX ─────────────────────────
const heroVisual = document.querySelector('.hero-visual');
window.addEventListener('mousemove', e => {
    if (!heroVisual || window.innerWidth < 900) return;
    const x = (e.clientX / window.innerWidth  - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    heroVisual.style.transform = `translate3d(${x}px, ${y}px, 0)`;
});

// ── TOAST NOTIFICATION ───────────────────────────
let toastEl    = null;
let toastTimer = null;

function showToast(msg) {
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.innerHTML = `
            <span class="toast-icon">
                <img src="./assets/icons/check.svg" alt="" aria-hidden="true"
                     style="width:12px;height:12px;filter:brightness(0.1)">
            </span>
            <span class="toast-msg"></span>`;
        document.body.appendChild(toastEl);
    }
    toastEl.querySelector('.toast-msg').textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
}

// ── COPY EMAIL TO CLIPBOARD ──────────────────────
document.querySelectorAll('.email-copyable').forEach(el => {
    el.addEventListener('click', async e => {
        e.preventDefault();
        const email = el.dataset.email
            || el.querySelector('b')?.textContent?.trim()
            || '';
        if (!email) return;
        try {
            await navigator.clipboard.writeText(email);
            showToast('Email copiata negli appunti!');
        } catch {
            showToast('Email: ' + email);
        }
    });
});

// ── COUNT-UP ANIMATION ───────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el   = entry.target;
        const raw  = el.getAttribute('data-target') || el.textContent.trim();
        const m    = raw.match(/^(\d+)(\D*)$/);
        if (!m) return;

        const target   = parseInt(m[1]);
        const suffix   = m[2];
        const duration = 1400;
        const t0       = performance.now();

        const tick = (now) => {
            const p    = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(ease * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.6 });

document.querySelectorAll('.summary-stat strong').forEach(el => {
    if (/^\d/.test(el.textContent.trim())) {
        el.setAttribute('data-target', el.textContent.trim());
        counterObserver.observe(el);
    }
});

// ── LIGHTBOX ─────────────────────────────────────
let lbImages  = [];
let lbIndex   = 0;
let lbOverlay = null;

function buildLightboxDOM() {
    const el = document.createElement('div');
    el.className = 'lightbox-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Visualizzatore immagini');
    el.innerHTML = `
        <button class="lightbox-close" aria-label="Chiudi">&#x2715;</button>
        <div class="lightbox-inner">
            <button class="lightbox-nav prev" aria-label="Immagine precedente">
                <img src="./assets/icons/arrow-right.svg" alt="" aria-hidden="true">
            </button>
            <img class="lightbox-img" src="" alt="">
            <button class="lightbox-nav next" aria-label="Immagine successiva">
                <img src="./assets/icons/arrow-right.svg" alt="" aria-hidden="true">
            </button>
        </div>
        <div class="lightbox-counter" aria-live="polite"></div>`;
    document.body.appendChild(el);

    el.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    el.querySelector('.prev').addEventListener('click', e => {
        e.stopPropagation(); moveLightbox(-1);
    });
    el.querySelector('.next').addEventListener('click', e => {
        e.stopPropagation(); moveLightbox(1);
    });
    el.addEventListener('click', e => {
        if (e.target === el) closeLightbox();
    });
    return el;
}

function openLightbox(images, index) {
    if (!lbOverlay) lbOverlay = buildLightboxDOM();
    lbImages = images;
    lbIndex  = index;
    renderLightbox();
    requestAnimationFrame(() => lbOverlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function renderLightbox() {
    const { src, alt } = lbImages[lbIndex];
    lbOverlay.querySelector('.lightbox-img').src = src;
    lbOverlay.querySelector('.lightbox-img').alt = alt;
    lbOverlay.querySelector('.lightbox-counter').textContent =
        `${lbIndex + 1} / ${lbImages.length}`;
    const multi = lbImages.length > 1;
    lbOverlay.querySelector('.prev').style.display = multi ? '' : 'none';
    lbOverlay.querySelector('.next').style.display = multi ? '' : 'none';
}

function moveLightbox(dir) {
    lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
    const img = lbOverlay.querySelector('.lightbox-img');
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.14s ease';
    setTimeout(() => {
        renderLightbox();
        img.style.opacity = '1';
    }, 120);
}

function closeLightbox() {
    lbOverlay?.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (lbOverlay && !lbOverlay.classList.contains('active')) {
            lbOverlay.querySelector('.lightbox-img').src = '';
        }
    }, 280);
}

document.addEventListener('keydown', e => {
    if (!lbOverlay?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
});

function initLightbox(selector) {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;
    const images = Array.from(items).map(el => ({
        src: el.querySelector('img')?.src  ?? '',
        alt: el.querySelector('img')?.alt  ?? ''
    }));
    items.forEach((item, i) => {
        item.addEventListener('click', () => openLightbox(images, i));
    });
}

initLightbox('.virginia-gallery-item');
initLightbox('.vendohub-gallery-item');
