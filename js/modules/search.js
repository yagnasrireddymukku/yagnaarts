/**
 * Live search: the nav overlay (top 5 matches + "view all" link) and the
 * full /pages/search.html results page. Both search the same in-memory
 * product list — see product-data.js for the fetch/cache.
 */
import { getProducts } from './product-data.js';

function matchesQuery(product, query) {
  const haystack = `${product.name} ${product.sku} ${product.collections.join(' ')}`.toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function resultRowHTML(product) {
  return `
    <a class="search-result-row" href="/product/${product.slug}/" style="display:flex; align-items:center; gap:.8rem; padding:.6rem; border-radius: var(--radius-md); text-decoration:none; color:inherit;">
      <img src="${product.images[0]}" alt="" width="44" height="44" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">
      <span style="flex:1; font-size:.9rem;">${product.name}</span>
      <span style="font-weight:600; font-size:.85rem;">&#8377;${product.price}</span>
    </a>`;
}

function initNavSearchOverlay() {
  const input = document.getElementById('siteSearchInput');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;

  input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      results.innerHTML = '';
      return;
    }
    const products = await getProducts();
    const matches = products.filter((p) => matchesQuery(p, query)).slice(0, 5);
    results.innerHTML = matches.length
      ? matches.map(resultRowHTML).join('') +
        `<a href="/pages/search.html?q=${encodeURIComponent(query)}" style="display:block; text-align:center; padding:.7rem; font-size:.85rem; font-weight:600; color:var(--color-secondary); text-decoration:none;">View all results &rarr;</a>`
      : `<p class="text-muted" style="padding:.6rem; font-size:.88rem;">No pieces match "${query}" yet.</p>`;
  });
}

async function initSearchPage() {
  const input = document.getElementById('searchPageInput');
  const status = document.querySelector('[data-search-status]');
  const grid = document.querySelector('[data-search-results]');
  if (!input || !grid) return;

  const { productCardHTML } = await import('./product-data.js');
  const { syncHeartIcons } = await import('./wishlist.js');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;

  async function runSearch(query) {
    if (!query) {
      status.innerHTML = '<p class="text-muted">Start typing above to search the full catalog — results appear here instantly.</p>';
      grid.innerHTML = '';
      return;
    }
    const products = await getProducts();
    const matches = products.filter((p) => matchesQuery(p, query));
    status.innerHTML = `<p class="text-muted">${matches.length} result${matches.length === 1 ? '' : 's'} for "${query}"</p>`;
    grid.innerHTML = matches.map(productCardHTML).join('');
    syncHeartIcons();
  }

  input.addEventListener('input', () => runSearch(input.value.trim()));
  if (initialQuery) runSearch(initialQuery);
}

export function initSearch() {
  initNavSearchOverlay();
  initSearchPage();
}
