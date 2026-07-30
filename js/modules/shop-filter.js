/**
 * Client-side sort/filter for any page with a [data-product-grid] of
 * .p-card elements (shop.html and every generated /collections/{slug}/
 * page). Reads price/rating/availability/production-type straight off the
 * card's data-* attributes (set in src/components/product-card.html) — no
 * extra fetch needed since the cards are already in the DOM.
 */

const PRICE_RANGES = {
  'Under ₹1,000': [0, 999],
  '₹1,000 – ₹2,500': [1000, 2500],
  '₹2,500 – ₹5,000': [2500, 5000],
  'Above ₹5,000': [5001, Infinity],
};

function cardMatchesFilters(card, activeFilters) {
  const price = parseFloat(card.dataset.price);

  if (activeFilters.price.length) {
    const inRange = activeFilters.price.some((label) => {
      const range = PRICE_RANGES[label];
      return range && price >= range[0] && price <= range[1];
    });
    if (!inRange) return false;
  }

  if (activeFilters.availability.length) {
    const readyToShip = card.dataset.availability === 'in-stock' && card.dataset.productionType === 'ready-to-ship';
    const madeToOrder = card.dataset.productionType === 'made-to-order';
    const matchesReady = activeFilters.availability.includes('Ready to ship') && readyToShip;
    const matchesMade = activeFilters.availability.includes('Made to order') && madeToOrder;
    if (!matchesReady && !matchesMade) return false;
  }

  if (activeFilters.customizable && card.dataset.customizable !== 'true') return false;

  return true;
}

function findFilterGroup(root, summaryText) {
  return Array.from(root.querySelectorAll('.shop-filter-group')).find((g) =>
    g.querySelector('summary')?.textContent.includes(summaryText)
  );
}

function checkedLabels(group) {
  if (!group) return [];
  return Array.from(group.querySelectorAll('input[type="checkbox"]:checked')).map((input) =>
    input.closest('label').textContent.replace(/\s+/g, ' ').trim()
  );
}

function readActiveFilters(root) {
  const customizableGroup = findFilterGroup(root, 'Customizable');
  return {
    price: checkedLabels(findFilterGroup(root, 'Price')),
    availability: checkedLabels(findFilterGroup(root, 'Availability')),
    customizable: checkedLabels(customizableGroup).length > 0,
  };
}

function applyFiltersAndSort(root) {
  const grid = root.querySelector('[data-product-grid]');
  const sortSelect = root.querySelector('[data-sort-select]');
  const resultCount = root.querySelector('[data-result-count]');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.p-card'));
  const filters = readActiveFilters(root);

  let visibleCount = 0;
  cards.forEach((card) => {
    const matches = cardMatchesFilters(card, filters);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  if (resultCount) resultCount.textContent = `${visibleCount} piece${visibleCount === 1 ? '' : 's'}`;

  const sortValue = sortSelect ? sortSelect.value : 'featured';
  if (sortValue !== 'featured') {
    const visible = cards.filter((c) => c.style.display !== 'none');
    visible.sort((a, b) => {
      if (sortValue === 'price-asc') return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      if (sortValue === 'price-desc') return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      if (sortValue === 'rating') return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      return 0;
    });
    visible.forEach((card) => grid.appendChild(card));
  }
}

export function initShopFilter() {
  const root = document.querySelector('.shop-layout');
  if (!root) return;

  root.addEventListener('change', () => applyFiltersAndSort(root));

  const clearBtn = root.querySelector('[data-clear-filters]');
  clearBtn?.addEventListener('click', () => {
    root.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    const sortSelect = root.querySelector('[data-sort-select]');
    if (sortSelect) sortSelect.value = 'featured';
    applyFiltersAndSort(root);
  });

  applyFiltersAndSort(root);
}
