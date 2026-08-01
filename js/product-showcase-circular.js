/* product-showcase-circular.js
 * Premium circular product wheel with GSAP "shared-element" hero expansion.
 * This is implemented in plain HTML/CSS/JS (current repo), but uses GSAP for cinematic motion.
 */

/* global gsap */

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------------------- Dummy product data --------------------
  // Used to populate hero details. We also read the clicked item meta from DOM.
  const FALLBACK_PRODUCTS = [
    {
      name: 'Dining Room',
      rating: 4.7,
      price: '₹10,000',
      description: 'A refined dining collection crafted to elevate every gathering.',
      colors: ['Walnut', 'Oak', 'Navy']
    },
    {
      name: 'Living Room',
      rating: 4.6,
      price: '₹12,000',
      description: 'Comfort-first living essentials with a premium, modern finish.',
      colors: ['Navy', 'White', 'Grey']
    },
    {
      name: 'Office Furniture',
      rating: 4.5,
      price: '₹8,000',
      description: 'Work-ready pieces designed for focus, durability and style.',
      colors: ['White', 'Walnut', 'Black']
    },
    {
      name: 'Wardrobes',
      rating: 4.8,
      price: '₹15,000',
      description: 'Clean lines, strong build quality, and a timeless wardrobe silhouette.',
      colors: ['Oak', 'Walnut', 'Black']
    },
    {
      name: 'Kitchen Furniture',
      rating: 4.4,
      price: '₹9,000',
      description: 'Storage that feels effortless—built for everyday flow in the kitchen.',
      colors: ['Grey', 'Walnut', 'White']
    },
    {
      name: 'Outdoor Furniture',
      rating: 4.3,
      price: '₹7,000',
      description: 'Weather-friendly pieces that bring premium comfort to open spaces.',
      colors: ['Black', 'Grey', 'Oak']
    }
  ];

  // -------------------- DOM hooks --------------------
  const wheelShell = $('#featuredCircularSlider');

  const sliderMode = wheelShell?.dataset?.sliderMode === 'horizontal' ? 'horizontal' : 'circular';
  const isHorizontal = sliderMode === 'horizontal';

  // Circular mode hooks
  const track = !isHorizontal ? $('#featuredCircularTrack') : null;
  const items = !isHorizontal && track ? $$('.circular-item', track) : $$('.circular-item', wheelShell);

  if (!wheelShell || items.length < 1) return;

  // Injected/required containers (added by editing home.html later)
  const heroShell = $('#circularProductHeroShell');
  const heroInner = $('#circularProductHeroInner');
  const heroMediaSlot = $('#circularProductHeroMediaSlot');
  const heroTitle = $('#circularProductHeroTitle');
  const heroStars = $('#circularProductHeroStars');
  const heroPrice = $('#circularProductHeroPrice');
  const heroDesc = $('#circularProductHeroDesc');
  const heroColorSelect = $('#circularProductHeroColorSelect');
  const heroSizeSelect = $('#circularProductHeroSizeSelect');
  const heroQty = $('#circularProductHeroQty');
  const btnBack = $('#circularProductHeroBack');

  const wishlistBtn = $('#circularProductHeroWishlistBtn');
  const shareBtn = $('#circularProductHeroShareBtn');

  // If the hero markup isn't present, we still keep wheel rotation behavior only.
  const hasHero = !!heroShell && !!heroInner && !!heroMediaSlot;

  // -------------------- State --------------------
  let isOpen = false;
  let heroTimeline = null;

  // Circular-only state
  let wheelTimeline = null;
  let wheelRot = 0;
  let wheelPaused = false;
  let lastTs = 0;
  let rafId = null;

  // -------------------- Helpers --------------------
  function getProductFromName(name) {
    if (!name) return null;
    return FALLBACK_PRODUCTS.find((p) => p.name.toLowerCase() === String(name).toLowerCase()) || null;
  }

  function setStars(el, rating) {
    if (!el) return;
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    let text = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) text += '★';
      else if (i === full && half) text += '⯨';
      else text += '☆';
    }
    el.textContent = text;
  }

  function pauseWheel() {
    wheelPaused = true;
  }

  function resumeWheel() {
    wheelPaused = false;
  }

  function setWheelRotation(deg) {
    wheelRot = deg;
    track.style.setProperty('--rotation', `${wheelRot}deg`);
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    if (!wheelPaused && !isOpen) {
      const speed = 9; // degrees per second
      setWheelRotation(wheelRot + (speed * dt) / 1000);
    }

    rafId = window.requestAnimationFrame(tick);
  }

  function startWheel() {
    if (isHorizontal) return;
    if (rafId) return;
    lastTs = 0;
    rafId = window.requestAnimationFrame(tick);
  }

  function stopWheel() {
    if (isHorizontal) return;
    if (!rafId) return;
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Create a circular "thumbnail" ghost for shared element transition.
  function buildGhostFromItem(itemEl) {
    const img = $('img', itemEl);
    if (!img) return null;

    const rect = img.getBoundingClientRect();

    const ghostImg = document.createElement('img');
    ghostImg.src = img.currentSrc || img.src;
    ghostImg.alt = img.alt || '';
    ghostImg.loading = 'eager';

    ghostImg.style.position = 'fixed';
    ghostImg.style.left = `${rect.left}px`;
    ghostImg.style.top = `${rect.top}px`;
    ghostImg.style.width = `${rect.width}px`;
    ghostImg.style.height = `${rect.height}px`;

    ghostImg.style.objectFit = 'cover';
    ghostImg.style.borderRadius = '999px';
    ghostImg.style.zIndex = '50000';
    ghostImg.style.pointerEvents = 'none';
    ghostImg.style.boxShadow = '0 30px 90px rgba(0,0,0,0.35)';

    document.body.appendChild(ghostImg);

    return ghostImg;
  }

  function setHeroContent(itemEl) {
    const metaTitle = $('h3', itemEl)?.textContent?.trim();
    const metaPriceText = $('.price', itemEl)?.textContent?.trim();

    const prod = getProductFromName(metaTitle);

    if (heroTitle) heroTitle.textContent = prod?.name || metaTitle || 'Product';

    const rating = prod?.rating ?? 4.6;
    setStars(heroStars, rating);

    if (heroPrice) heroPrice.textContent = prod?.price || metaPriceText || '₹—';
    if (heroDesc) heroDesc.textContent = prod?.description || 'Premium furniture designed for comfort and durability.';

    if (heroColorSelect) {
      const colors = prod?.colors || ['Walnut', 'Oak', 'Navy'];
      heroColorSelect.innerHTML = colors
        .map(
          (c) =>
            `<button type="button" class="hero-color-dot" data-color="${c}" aria-label="${c}"></button>`
        )
        .join('');

      // basic visual mapping based on known names
      const map = {
        Walnut: '#5C3A21',
        Oak: '#C8A45D',
        Navy: '#1F3A5F',
        White: '#F5F5F5',
        Grey: '#7A7A7A',
        Black: '#1A1A1A'
      };

      $$('.hero-color-dot', heroColorSelect).forEach((b) => {
        const c = b.dataset.color;
        b.style.setProperty('--sw', map[c] || '#B08D57');
      });

      // Activate first
      const first = $$('.hero-color-dot', heroColorSelect)[0];
      if (first) first.classList.add('is-active');

      $$('.hero-color-dot', heroColorSelect).forEach((b) => {
        b.addEventListener('click', () => {
          $$('.hero-color-dot', heroColorSelect).forEach((x) => x.classList.remove('is-active'));
          b.classList.add('is-active');
        });
      });
    }

    if (heroSizeSelect) {
      // optional size selector, kept minimal
      heroSizeSelect.innerHTML = '';
      ['S', 'M', 'L'].forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hero-size-btn';
        btn.textContent = s;
        btn.setAttribute('aria-label', `Size ${s}`);
        if (idx === 1) btn.classList.add('is-active');
        btn.addEventListener('click', () => {
          $$('.hero-size-btn', heroSizeSelect).forEach((x) => x.classList.remove('is-active'));
          btn.classList.add('is-active');
        });
        heroSizeSelect.appendChild(btn);
      });
    }

    if (heroQty) heroQty.value = '1';
  }

  function openHero(itemEl) {
    if (!hasHero) return;
    if (isOpen) return;

    isOpen = true;
    pauseWheel();
    setHeroContent(itemEl);

    const heroImg = $('#circularProductHeroImage');
    const itemImg = $('img', itemEl);
    if (heroImg && itemImg) {
      heroImg.src = itemImg.currentSrc || itemImg.src;
      heroImg.alt = itemImg.alt || 'Selected product';
    }

    const allItems = isHorizontal ? $$('.circular-item', wheelShell) : $$('.circular-item', track);
    allItems.forEach((el) => {
      el.style.pointerEvents = 'none';
      el.style.opacity = el === itemEl ? '1' : '0.2';
      el.style.filter = el === itemEl ? 'none' : 'blur(2px)';
    });

    heroShell.classList.remove('hero-hidden');
    heroShell.setAttribute('aria-hidden', 'false');
    heroInner.style.opacity = '1';
    heroInner.style.transform = 'translateY(0)';
    heroInner.style.filter = 'blur(0px)';
    $$('.circular-hero-detail').forEach((detail) => {
      detail.style.opacity = '1';
      detail.style.transform = 'translateY(0)';
    });
  }

  function closeHero() {
    if (!hasHero) return;
    if (!isOpen) return;

    isOpen = false;
    heroShell.classList.add('hero-hidden');
    heroShell.setAttribute('aria-hidden', 'true');
    resumeWheel();

    const restoreItems = isHorizontal ? $$('.circular-item', wheelShell) : $$('.circular-item', track);
    restoreItems.forEach((el) => {
      el.style.pointerEvents = '';
      el.style.opacity = '';
      el.style.filter = '';
    });
  }

  // -------------------- Bind click + back --------------------
  items.forEach((itemEl, idx) => {
    itemEl.style.cursor = 'pointer';

    itemEl.addEventListener('click', () => {
      if (isOpen) return;
      if (heroShell) heroShell.dataset.selectedIndex = String(idx);
      openHero(itemEl);
    });

    itemEl.addEventListener('mouseenter', () => {
      if (isOpen) return;
      itemEl.classList.add('is-hovered');
    });
    itemEl.addEventListener('mouseleave', () => {
      if (isOpen) return;
      itemEl.classList.remove('is-hovered');
    });
  });

  if (btnBack) btnBack.addEventListener('click', closeHero);

  // -------------------- Init --------------------
  if (!isHorizontal) {
    // Ensure CSS variables are set for initial wheel layout
    const itemCount = Math.max(1, items.length);
    track.style.setProperty('--angleStep', `${360 / itemCount}deg`);

    // Start circular wheel rotation
    startWheel();

    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseWheel();
      else if (!isOpen) resumeWheel();
    });

    // Mobile swipe support (lightweight)
    function initSwipe() {
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile) return;

      let startX = 0;
      let dx = 0;
      let dragging = false;

      wheelShell.addEventListener('touchstart', (e) => {
        if (isOpen) return;
        const t = e.touches[0];
        startX = t.clientX;
        dx = 0;
        dragging = true;
      }, { passive: true });

      wheelShell.addEventListener('touchmove', (e) => {
        if (!dragging || isOpen) return;
        const t = e.touches[0];
        dx = t.clientX - startX;

        // Convert swipe to rotation
        const strength = 0.2;
        setWheelRotation(wheelRot + (-dx * strength));
      }, { passive: true });

      wheelShell.addEventListener('touchend', () => {
        if (!dragging || isOpen) return;
        dragging = false;

        // Snap by step
        const angleStep = 360 / items.length;
        const snapped = Math.round(wheelRot / angleStep) * angleStep;
        if (prefersReduced) {
          setWheelRotation(snapped);
        } else {
          gsap.to({ v: wheelRot }, {
            duration: 0.45,
            v: snapped,
            ease: 'power2.out',
            onUpdate: function () {
              setWheelRotation(this.targets()[0].v);
            }
          });
        }
      });
    }

    initSwipe();
  } else {
    // Horizontal slider: hook arrows to scroll
    const prevBtn = wheelShell.querySelector('[data-horizontal-prev]');
    const nextBtn = wheelShell.querySelector('[data-horizontal-next]');
    const trackEl = wheelShell.querySelector('#featuredHorizontalTrack');

    if (trackEl && items.length > 0) {
      const firstItem = items[0];

      function scrollByOne(direction) {
        if (!trackEl || !firstItem) return;
        const itemRect = firstItem.getBoundingClientRect();
        const trackRect = trackEl.getBoundingClientRect();
        const delta = (itemRect.width || 270) + 22; // width + gap approximation
        const amount = direction * delta;

        trackEl.scrollBy({ left: amount, behavior: prefersReduced ? 'auto' : 'smooth' });

        // Focus handling (accessibility)
        if (wheelShell.focus) wheelShell.focus();
      }

      if (prevBtn) prevBtn.addEventListener('click', () => scrollByOne(-1));
      if (nextBtn) nextBtn.addEventListener('click', () => scrollByOne(1));
    }
  }
})();

