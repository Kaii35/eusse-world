// @ts-nocheck
// Scroll + motion engine for the EUSSE WORLD landing. One rAF loop, transform/opacity only.
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = 'cubic-bezier(.2,.7,.2,1)';

export function initEusse(root, loadGlobe) {
  const q = (s) => root.querySelector(s);
  const qa = (s) => Array.from(root.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let disposed = false, globe = null, raf = 0;

  const gEl = q('[data-globe]');
  if (gEl && loadGlobe) loadGlobe().then((m) => { if (!disposed) globe = m.createGlobe(gEl); }).catch((e) => console.warn('globe', e));

  // Intro (hero) — staggered rise on load
  qa('[data-intro]').forEach((el, i) => {
    if (reduce) return;
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0,36px,0)';
    el.style.transition = `opacity 1.1s ${ease} ${180 + i * 110}ms, transform 1.1s ${ease} ${180 + i * 110}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; }));
  });

  // Scroll reveal
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.style.opacity = '1'; e.target.style.transform = 'none';
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  qa('[data-reveal]').forEach((el) => {
    if (reduce || el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    const d = +(el.dataset.delay || 0);
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0,44px,0)';
    el.style.transition = `opacity .9s ${ease} ${d}ms, transform .9s ${ease} ${d}ms`;
    io.observe(el);
  });

  const nav = q('[data-nav]');
  const heroContent = q('[data-hero-content]');
  const heroGlobe = q('[data-hero-globe]');
  const heroGrid = q('[data-hero-grid]');
  const heroStrip = q('[data-hero-strip]');
  const px = qa('[data-px]').map((el) => ({ el, s: parseFloat(el.dataset.px) || 0 }));
  const marquees = qa('[data-marquee]').map((el) => ({ el, dir: el.dataset.marquee === 'rev' ? -1 : 1, off: 0 }));
  const manifesto = q('[data-manifesto]');
  const phrases = qa('[data-phrase]');
  const proc = q('[data-process]');
  const box = q('[data-box]'), boxRot = q('[data-box-rot]'), trackEl = q('[data-track]'), fill = q('[data-fill]');
  const steps = qa('[data-step]'), nodes = qa('[data-node]');
  const counter = q('[data-step-count]');

  let mx = 0, my = 0, tx = 0, ty = 0, lastY = -1, vel = 0, last = performance.now(), navSolid = null, activeStep = -1;
  const onMove = (e) => { mx = e.clientX / window.innerWidth - 0.5; my = e.clientY / window.innerHeight - 0.5; };
  window.addEventListener('pointermove', onMove, { passive: true });

  function frame(now) {
    const dt = Math.min(64, now - last); last = now;
    const y = window.scrollY, vh = window.innerHeight;
    const scrolled = y !== lastY;
    vel += ((y - (lastY < 0 ? y : lastY)) - vel) * 0.2;
    lastY = y;

    tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
    if (globe) { globe.setPointer(tx, ty); globe.setScroll(clamp(y / vh, 0, 1.5)); }

    if (!reduce) {
      marquees.forEach((m) => {
        const half = m.el.scrollWidth / 2 || 1;
        m.off = (m.off + dt * (0.05 + Math.min(1.2, Math.abs(vel) * 0.02)) * m.dir) % half;
        m.el.style.transform = `translate3d(${m.off > 0 ? -m.off : -(half + m.off)}px,0,0)`;
      });
    }

    if (scrolled || navSolid === null) {
      const solid = y > 40;
      if (solid !== navSolid && nav) {
        navSolid = solid;
        nav.style.background = solid ? 'rgba(29,45,61,.82)' : 'rgba(29,45,61,0)';
        nav.style.backdropFilter = solid ? 'blur(14px) saturate(1.2)' : 'none';
        nav.style.borderBottomColor = solid ? 'rgba(181,217,253,.14)' : 'rgba(181,217,253,0)';
      }
      if (!reduce && y < vh * 1.3) {
        if (heroContent) { heroContent.style.transform = `translate3d(0,${y * 0.32}px,0)`; heroContent.style.opacity = String(clamp(1 - y / (vh * 0.85))); }
        if (heroStrip) { heroStrip.style.transform = `translate3d(0,${y * 0.32}px,0)`; heroStrip.style.opacity = String(clamp(1 - y / (vh * 0.6))); }
        if (heroGrid) heroGrid.style.transform = `translate3d(0,${y * 0.5}px,0)`;
      }
      if (!reduce) px.forEach(({ el, s }) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.transform = `translate3d(0,${((r.top + r.height / 2) - vh / 2) * s}px,0)`;
      });

      if (manifesto && phrases.length) {
        const r = manifesto.getBoundingClientRect();
        const p = clamp((vh * 0.78 - r.top) / (r.height + vh * 0.2));
        phrases.forEach((el, i) => {
          const o = clamp(p * phrases.length * 1.15 - i);
          el.style.opacity = String(0.14 + 0.86 * o);
        });
      }

      if (proc && box && trackEl) {
        const r = proc.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height - vh));
        const w = trackEl.offsetWidth;
        box.style.transform = `translate3d(${p * w}px,0,0)`;
        if (boxRot) boxRot.style.transform = `rotateX(-18deg) rotateY(${-32 + p * 64}deg)`;
        if (fill) fill.style.transform = `scaleX(${p})`;
        const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999 + 0.0001));
        if (idx !== activeStep) {
          activeStep = idx;
          steps.forEach((s, i) => { s.style.opacity = i === idx ? '1' : i < idx ? '.5' : '.28'; s.style.transform = i === idx ? 'translate3d(0,-6px,0)' : 'none'; });
          nodes.forEach((n, i) => { n.style.background = i <= idx ? '#b5d9fd' : '#1d2d3d'; n.style.borderColor = i <= idx ? '#b5d9fd' : 'rgba(181,217,253,.4)'; });
          if (counter) counter.textContent = String(idx + 1).padStart(2, '0');
        }
      }
    }
    if (heroGlobe && !reduce && y < vh * 1.3) heroGlobe.style.transform = `translate3d(${tx * -18}px,${y * 0.18 + ty * -12}px,0)`;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const form = q('[data-form]'), sent = q('[data-sent]');
  const onSubmit = (e) => {
    e.preventDefault();
    if (sent) { sent.style.display = 'flex'; }
    form.reset();
  };
  form && form.addEventListener('submit', onSubmit);

  return () => {
    disposed = true; cancelAnimationFrame(raf); io.disconnect();
    window.removeEventListener('pointermove', onMove);
    form && form.removeEventListener('submit', onSubmit);
    globe && globe.dispose();
  };
}
