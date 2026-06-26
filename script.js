/* ───────────────────────── App registry ─────────────────────────
   One entry per app. To add an app:
     1. create its folder (e.g. budget/) with help/privacy/contact pages,
     2. add a [data-app="id"] theme block (light + dark) in styles.css,
     3. add an entry below.
   The home-page carousel renders itself from this list automatically.
   `name`/`tagline`/`footer`/card text may be a string or a {fr, en} object. */

const APPS = [
  {
    id: 'budget',
    name: 'Budget',
    tagline: { fr: 'par Sleeplow', en: 'by Sleeplow' },
    footer: {
      fr: 'Budget — application iOS de gestion budgétaire personnelle',
      en: 'Budget — personal finance iOS application'
    },
    cards: {
      fr: [
        { icon: '📖', title: 'Aide & fonctionnalités', desc: "Apprenez à utiliser toutes les fonctions de l'application", href: 'budget/help.html' },
        { icon: '🔒', title: 'Politique de confidentialité', desc: 'Comment vos données sont traitées et protégées', href: 'budget/privacy.html' },
        { icon: '✉️', title: 'Contact & signaler un bug', desc: 'Une question, une suggestion ou un problème ?', href: 'budget/contact.html' }
      ],
      en: [
        { icon: '📖', title: 'Help & Features', desc: "Learn how to use all of the app's features", href: 'budget/help.html' },
        { icon: '🔒', title: 'Privacy Policy', desc: 'How your data is handled and protected', href: 'budget/privacy.html' },
        { icon: '✉️', title: 'Contact & Report a Bug', desc: 'A question, a suggestion or a problem?', href: 'budget/contact.html' }
      ]
    }
  },

  /* Placeholder slide — demonstrates the multi-app navigation. Replace with a
     real app (own folder + [data-app="..."] theme block) or delete this entry. */
  {
    id: 'next',
    name: { fr: 'Votre prochaine app', en: 'Your next app' },
    tagline: { fr: 'par Sleeplow', en: 'by Sleeplow' },
    footer: {
      fr: 'Un emplacement prêt pour votre prochaine application',
      en: 'A slot ready for your next application'
    },
    cards: {
      fr: [{ icon: '✨', title: 'Bientôt disponible', desc: 'Une nouvelle application arrive ici', soon: 'Bientôt' }],
      en: [{ icon: '✨', title: 'Coming soon', desc: 'A new application is on its way here', soon: 'Soon' }]
    }
  }
];

/* ─────────────────────── Carousel state ─────────────────────── */

let current = 0;
let currentLang = 'fr';

// Resolve a string-or-{fr,en} value for the active language.
function t(value, lang) {
  return value && typeof value === 'object' ? value[lang] : value;
}

function buildCard(card) {
  const tail = card.soon
    ? `<span class="soon-badge">${card.soon}</span>`
    : '<span class="menu-arrow">›</span>';
  const inner =
    `<span class="menu-icon">${card.icon}</span>` +
    `<span class="menu-text"><h2>${card.title}</h2><p>${card.desc}</p></span>` +
    tail;
  return card.href
    ? `<a class="menu-card" href="${card.href}">${inner}</a>`
    : `<div class="menu-card soon">${inner}</div>`;
}

function renderTrack(lang) {
  const track = document.getElementById('carousel-track');
  track.innerHTML = APPS.map(app => {
    const cards = app.cards[lang].map(buildCard).join('');
    return `<div class="slide"><nav class="menu">${cards}</nav>` +
           `<p class="updated">${app.footer[lang]}</p></div>`;
  }).join('');
}

function renderDots(lang) {
  const dots = document.getElementById('carousel-dots');
  if (APPS.length < 2) { dots.hidden = true; return; }
  dots.hidden = false;
  dots.innerHTML = APPS.map((app, i) =>
    `<button class="dot${i === current ? ' active' : ''}" type="button" ` +
    `aria-label="${t(app.name, lang)}"></button>`).join('');
  dots.querySelectorAll('.dot').forEach((dot, i) =>
    dot.addEventListener('click', () => goTo(i)));
}

// Update the header (icon/name/tagline) and theme to the current app.
function updateHeader(lang) {
  const app = APPS[current];
  document.documentElement.setAttribute('data-app', app.id);
  const name = document.getElementById('app-name');
  const tagline = document.getElementById('app-tagline');
  const logo = document.getElementById('app-logo');
  if (name) name.textContent = t(app.name, lang);
  if (tagline) tagline.textContent = t(app.tagline, lang);
  if (logo) logo.setAttribute('aria-label', t(app.name, lang));
}

// Slide the track and refresh dots/arrow states for the current index.
function updatePosition() {
  const track = document.getElementById('carousel-track');
  if (track) track.style.transform = `translateX(-${current * 100}%)`;
  document.querySelectorAll('.carousel-dots .dot').forEach((dot, i) =>
    dot.classList.toggle('active', i === current));
  const prev = document.querySelector('.carousel-arrow.prev');
  const next = document.querySelector('.carousel-arrow.next');
  if (prev) prev.disabled = current === 0;
  if (next) next.disabled = current === APPS.length - 1;
}

function goTo(index) {
  current = Math.max(0, Math.min(APPS.length - 1, index));
  updateHeader(currentLang);
  updatePosition();
}

// Full (re)render — called on first load and whenever the language changes.
function renderCarousel(lang) {
  currentLang = lang;
  renderTrack(lang);
  renderDots(lang);
  updateHeader(lang);
  updatePosition();
}

// Wire the static controls (arrows, keyboard, swipe) once.
function setupCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const prev = carousel.querySelector('.carousel-arrow.prev');
  const next = carousel.querySelector('.carousel-arrow.next');
  if (prev) prev.addEventListener('click', () => goTo(current - 1));
  if (next) next.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    else if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let startX = null;
  const viewport = carousel.querySelector('.carousel-viewport');
  viewport.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  // A single app has nothing to navigate.
  if (APPS.length < 2) carousel.querySelectorAll('.carousel-arrow').forEach(a => { a.hidden = true; });
}

/* ─────────────────────── Language + content ─────────────────────── */

function setLang(lang) {
  document.querySelectorAll('[lang-section]').forEach(el => {
    el.style.display = el.getAttribute('lang-section') === lang ? 'block' : 'none';
  });
  document.querySelectorAll('.lang-switch button').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && lang === 'fr') || (i === 1 && lang === 'en'));
  });
  try { localStorage.setItem('budget-lang', lang); } catch (e) {}
  // Carousel cards are language-specific, so re-render them in place.
  if (document.querySelector('.carousel')) renderCarousel(lang);
}

// Make content sections collapsible: only the title shows until tapped.
function setupCollapsibleSections() {
  document.querySelectorAll('.section').forEach(section => {
    if (!section.querySelector('h2')) return;
    section.classList.add('collapsed');
    const title = section.querySelector('h2');
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    const toggle = () => section.classList.toggle('collapsed');
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

// Restore language: URL param (?lang=fr/en) takes priority, then localStorage, then default fr.
document.addEventListener('DOMContentLoaded', () => {
  let lang = 'fr';
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'fr' || urlLang === 'en') {
    lang = urlLang;
  } else {
    try { lang = localStorage.getItem('budget-lang') || 'fr'; } catch (e) {}
  }
  setupCarousel();
  setLang(lang);
  setupCollapsibleSections();
});
