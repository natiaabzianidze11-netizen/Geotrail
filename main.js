'use strict';

/* ===== 1. Mobile menu ===== */
(function initMenu() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();

/* ===== 2. Destination filter ===== */
(function initFilter() {
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('.card');
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      cards.forEach((card) => {
        card.hidden = !(filter === 'all' || card.dataset.category === filter);
      });
    });
  });
})();

/* ===== 3. Slider ===== */
(function initSlider() {
  const slider = document.getElementById('slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const dotsBox = document.getElementById('dots');
  const AUTOPLAY_MS = 6000;
  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `სლაიდი ${i + 1}`);
    dot.addEventListener('click', () => { show(i); restart(); });
    dotsBox.appendChild(dot);
    return dot;
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
    dots.forEach((d, n) => {
      d.classList.toggle('is-active', n === index);
      d.setAttribute('aria-selected', String(n === index));
    });
  }

  const start = () => { timer = setInterval(() => show(index + 1), AUTOPLAY_MS); };
  const stop = () => clearInterval(timer);
  const restart = () => { stop(); start(); };

  document.getElementById('prevBtn').addEventListener('click', () => { show(index - 1); restart(); });
  document.getElementById('nextBtn').addEventListener('click', () => { show(index + 1); restart(); });
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { show(index - 1); restart(); }
    if (e.key === 'ArrowRight') { show(index + 1); restart(); }
  });

  show(0);
  start();
})();

/* ===== 4. Booking form validation ===== */
(function initForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  const status = document.getElementById('formStatus');

  const rules = {
    name: (v) => (v.trim().length >= 3 ? '' : 'შეიყვანეთ მინიმუმ 3 სიმბოლო.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'შეიყვანეთ სწორი ელ-ფოსტა.'),
    destination: (v) => (v ? '' : 'აირჩიეთ მიმართულება.'),
    people: (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 20 ? '' : 'რაოდენობა უნდა იყოს 1-დან 20-მდე.';
    },
  };

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const message = rule(field.value);
    const errorBox = document.getElementById(`${field.name}Error`);
    if (errorBox) errorBox.textContent = message;
    field.classList.toggle('is-invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => { if (field.classList.contains('is-invalid')) validateField(field); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.className = 'form-status';
    const valid = Object.keys(rules).map((n) => validateField(form.elements[n])).every(Boolean);
    if (!valid) {
      status.textContent = 'გთხოვთ, შეასწოროთ მონიშნული ველები.';
      form.querySelector('.is-invalid')?.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    console.info('Booking request:', data); // რეალურ პროექტში აქ იქნებოდა fetch() სერვერზე
    status.textContent = `გმადლობთ, ${data.name.trim()}! თქვენი მოთხოვნა მიღებულია.`;
    status.classList.add('ok');
    form.reset();
  });
})();

/* ===== 5. Back-to-top button (throttled via rAF) ===== */
(function initToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btn.hidden = window.scrollY < 600;
      ticking = false;
    });
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
