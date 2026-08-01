// products.js - Products page interactions (search, filters, sort, wishlist, drawer)
/* eslint-env browser */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ============================================================
   * 1. RENDER STARS FROM data-stars
   * ============================================================ */
  function renderStars() {
    $$('.stars').forEach((el) => {
      const rating = parseFloat(el.dataset.stars) || 0;
      const full = Math.floor(rating);
      const half = rating - full >= 0.5;
      let html = '';
      for (let i = 0; i < 5; i++) {
        if (i < full) html += '★';
        else if (i === full && half) html += '⯨';
        else html += '☆';
      }
      el.textContent = html;
    });
  }

  /* ============================================================
   * 3. PRODUCT STATE (filters / sort)
   * ============================================================ */
  const state = {
    search: '',
    sort: 'featured',
    categories: [],
    materials: [],
    colors: [],
    rating: 0,
    priceMin: null,
    priceMax: null,
  };

  function getCards() {
    return $$('.product-card', $('#productGrid'));
  }

  function applyFilters() {
    const cards = getCards();
    let visible = 0;

    cards.forEach((card) => {
      const name = (card.dataset.name || '').toLowerCase();
      const cat = card.dataset.category;
      const mat = card.dataset.material;
      const col = card.dataset.color;
      const rate = parseFloat(card.dataset.rating) || 0;
      const price = parseInt(card.dataset.price, 10) || 0;

      const matchSearch = !state.search || name.includes(state.search);
      const matchCat = !state.categories.length || state.categories.includes(cat);
      const matchMat = !state.materials.length || state.materials.includes(mat);
      const matchCol = !state.colors.length || state.colors.includes(col);
      const matchRate = !state.rating || rate >= state.rating;
      const matchMin = state.priceMin === null || price >= state.priceMin;
      const matchMax = state.priceMax === null || price <= state.priceMax;

      const show = matchSearch && matchCat && matchMat && matchCol && matchRate && matchMin && matchMax;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Sort visible cards by moving them in DOM order
    const grid = $('#productGrid');
    const sorted = cards
      .filter((c) => c.style.display !== 'none')
      .sort(sortComparator);
    sorted.forEach((c) => grid.appendChild(c));

    // Update meta + empty state
    const total = cards.length;
    const meta = $('#productsMeta');
    const empty = $('#productsEmpty');
    if (meta) meta.textContent = `Showing ${visible} of ${total} products`;
    if (empty) empty.hidden = visible !== 0;
  }

  function sortComparator(a, b) {
    const pa = parseInt(a.dataset.price, 10) || 0;
    const pb = parseInt(b.dataset.price, 10) || 0;
    const ra = parseFloat(a.dataset.rating) || 0;
    const rb = parseFloat(b.dataset.rating) || 0;
    const na = (a.dataset.name || '').toLowerCase();
    const nb = (b.dataset.name || '').toLowerCase();
    switch (state.sort) {
      case 'price-asc':  return pa - pb;
      case 'price-desc': return pb - pa;
      case 'rating':     return rb - ra;
      case 'name':       return na.localeCompare(nb);
      default: return 0;
    }
  }

  /* ============================================================
   * 4. FILTER PANEL (mobile drawer)
   * ============================================================ */
  function initFilterPanel() {
    const panel = $('#filterPanel');
    const toggle = $('#filterToggle');
    const close = $('#filterClose');
    const backdrop = $('#filterBackdrop');
    const clear = $('#filterClear');
    if (!panel || !toggle) return;

    const setOpen = (isOpen) => {
      panel.classList.toggle('is-open', isOpen);
      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
    if (close) close.addEventListener('click', () => setOpen(false));
    if (backdrop) backdrop.addEventListener('click', () => setOpen(false));

    // Category + Material checkboxes
    $$('.filter-list[data-filter]').forEach((list) => {
      const key = list.dataset.filter; // 'category' | 'material'
      list.addEventListener('change', () => {
        const values = $$('input[type="checkbox"]:checked', list).map((c) => c.value);
        state[key] = values;
        applyFilters();
      });
    });

    // Color swatches
    $$('.filter-colors button[data-color]').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('is-active');
        state.colors = $$('.filter-colors button.is-active').map((b) => b.dataset.color);
        applyFilters();
      });
    });

    // Rating pills
    $$('.filter-rating button[data-rating]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isActive = btn.classList.contains('is-active');
        $$('.filter-rating button').forEach((b) => b.classList.remove('is-active'));
        if (!isActive) {
          btn.classList.add('is-active');
          state.rating = parseInt(btn.dataset.rating, 10) || 0;
        } else {
          state.rating = 0;
        }
        applyFilters();
      });
    });

    // Price range
    const min = $('#priceMin');
    const max = $('#priceMax');
    const onPrice = () => {
      state.priceMin = min && min.value !== '' ? parseInt(min.value, 10) : null;
      state.priceMax = max && max.value !== '' ? parseInt(max.value, 10) : null;
      applyFilters();
    };
    if (min) min.addEventListener('input', onPrice);
    if (max) max.addEventListener('input', onPrice);

    // Clear all
    if (clear) {
      clear.addEventListener('click', () => {
        $$('input[type="checkbox"]', panel).forEach((c) => (c.checked = false));
        if (min) min.value = '';
        if (max) max.value = '';
        $$('.filter-colors button').forEach((b) => b.classList.remove('is-active'));
        $$('.filter-rating button').forEach((b) => b.classList.remove('is-active'));
        state.categories = [];
        state.materials = [];
        state.colors = [];
        state.rating = 0;
        state.priceMin = null;
        state.priceMax = null;
        applyFilters();
      });
    }
  }

  /* ============================================================
   * 5. SEARCH + SORT
   * ============================================================ */
  function initSearchAndSort() {
    const search = $('#productSearch');
    const sort = $('#productSort');
    if (search) {
      search.addEventListener('input', () => {
        state.search = search.value.trim().toLowerCase();
        applyFilters();
      });
    }
    if (sort) {
      sort.addEventListener('change', () => {
        state.sort = sort.value;
        applyFilters();
      });
    }
  }

  /* ============================================================
   * 6. WISHLIST TOGGLE
   * ============================================================ */
  function initWishlist() {
    $$('.wishlist-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        btn.classList.toggle('is-active');
        const card = btn.closest('.product-card');
        const name = card ? card.dataset.name : 'item';
        btn.setAttribute('aria-label', btn.classList.contains('is-active')
          ? `Remove ${name} from wishlist`
          : `Add ${name} to wishlist`);
      });
    });
  }

  /* ============================================================
   * 7. QUICK VIEW (lightweight toast — replace with modal if needed)
   * ============================================================ */
  function initQuickView() {
    $$('.quick-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.product-card');
        if (!card) return;
        const name = card.dataset.name || 'Product';
        showToast(`Quick view: ${name}`);
      });
    });
  }

  /* ============================================================
   * 8. LOAD MORE (simulated pagination)
   * ============================================================ */
  function initLoadMore() {
    const btn = $('#loadMoreBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Loading…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'No more products';
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }, 700);
    });
  }

  /* ============================================================
   * 9. LIGHTWEIGHT TOAST
   * ============================================================ */
  let toastEl;
  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  /* ============================================================
   * BOOT
   * ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    renderStars();
    initFilterPanel();
    initSearchAndSort();
    initWishlist();
    initQuickView();
    initLoadMore();
  });
})();
