/**
 * DevVisionLab – Main JavaScript
 * Handles: nav, reveal animations, counter, marquee, particles, cursor
 */

'use strict';

// ── Nav scroll ────────────────────────────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Mobile nav ────────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const overlay   = document.querySelector('.overlay');
const mobileClose = document.querySelector('.mobile-nav-close');

function openMobileNav() {
  mobileNav?.classList.add('open');
  overlay?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  mobileNav?.classList.remove('open');
  overlay?.classList.remove('show');
  document.body.style.overflow = '';
}
hamburger?.addEventListener('click', openMobileNav);
mobileClose?.addEventListener('click', closeMobileNav);
overlay?.addEventListener('click', closeMobileNav);

// ── Active nav link ───────────────────────────────────────────
(function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html') ||
        (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

// ── Intersection Observer – reveal animations ─────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-scale, .stagger').forEach(el => {
  revealObserver.observe(el);
});

// ── Counter animation ─────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || el.textContent);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const dur    = parseInt(el.dataset.dur || '1800');
  const steps  = 60;
  let current  = 0;
  const increment = target / steps;
  const stepDur = dur / steps;
  const isFloat = target % 1 !== 0;

  const tick = () => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (current < target) setTimeout(tick, stepDur);
  };
  tick();
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// ── Progress bars ─────────────────────────────────────────────
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelector('.progress-fill')?.classList.add('animated');
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.progress-bar').forEach(el => barObserver.observe(el));

// ── Cursor glow (desktop only) ────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-glow';
  document.body.appendChild(cursor);
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
}

// ── Typed text effect ─────────────────────────────────────────
function initTyped(el) {
  const words = JSON.parse(el.dataset.typed || '[]');
  if (!words.length) return;
  let wi = 0, ci = 0, deleting = false;
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  el.after(cursor);

  const speed = () => deleting ? 60 : 120;
  const pause = 2000;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; return setTimeout(type, pause); }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, speed());
  }
  type();
}
document.querySelectorAll('[data-typed]').forEach(initTyped);

// ── Ripple effect on buttons ──────────────────────────────────
document.querySelectorAll('.btn').forEach(btn => {
  btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  btn.addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });
});

// ── Contact form ──────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('[type=submit]');
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // Simulate async send
    setTimeout(() => {
      btn.textContent = '✓ Sent! We\'ll reply soon.';
      btn.style.background = 'var(--clr-green)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.background = '';
        contactForm.reset();
      }, 4000);
    }, 1500);
  });
}

// ── Particle canvas ───────────────────────────────────────────
function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.r  = Math.random() * 1.5 + .5;
      this.alpha = Math.random() * .5 + .1;
      this.color = Math.random() > .5 ? '108,99,255' : '0,212,255';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const count = Math.floor(canvas.width * canvas.height / 8000);
  for (let i = 0; i < Math.min(count, 120); i++) particles.push(new Particle());

  // Draw connections
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${.12 * (1 - dist / 100)})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  let raf;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    raf = requestAnimationFrame(animate);
  }

  // Only run when visible
  const pObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (!raf) animate(); }
    else { cancelAnimationFrame(raf); raf = null; }
  });
  pObserver.observe(canvas);
}
initParticles('particle-canvas');

// ── Smooth anchor scrolling ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileNav();
    }
  });
});

// ── Lazy load images ──────────────────────────────────────────
if ('IntersectionObserver' in window) {
  const imgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        imgObserver.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}
