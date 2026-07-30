/**
 * Client-side access to the product catalog. Pages are pre-rendered at
 * build time (see scripts/build.js) with their own product data already
 * baked in as HTML — this module exists for the interactive layer on top:
 * cart/wishlist rendering, live search, and sort/filter, all of which need
 * to look up arbitrary products by id at runtime.
 */

let cache = null;

export async function getProducts() {
  if (cache) return cache;
  const res = await fetch('/data/products.json');
  const json = await res.json();
  cache = json.products;
  return cache;
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function getProductsByIds(ids) {
  const products = await getProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/**
 * Renders the same markup as src/components/product-card.html, client-side.
 * Keep this in sync with that file if the card design changes.
 */
export function productCardHTML(product) {
  const badge = product.badge
    ? `<span class="p-badge">${product.badge}</span>`
    : '';
  const compareAt = product.compareAtPrice
    ? ` <s>&#8377;${product.compareAtPrice}</s>`
    : '';
  return `
    <a class="p-card" href="/product/${product.slug}/" data-price="${product.price}" data-rating="${product.rating}" data-availability="${product.availability}" data-production-type="${product.productionTime.type}" data-customizable="${product.customizable}">
      <div class="p-media">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" width="400" height="400">
        ${badge}
        <button class="p-wish" aria-label="Add to wishlist" data-wishlist-toggle data-product-id="${product.id}">
          <i class="bi bi-heart" aria-hidden="true"></i>
        </button>
      </div>
      <div class="p-body">
        <div class="p-cat">${product.sku}</div>
        <div class="p-name">${product.name}</div>
        <div class="p-meta">
          <span class="p-price">&#8377;${product.price}${compareAt}</span>
          <span class="p-rating"><i class="bi bi-star-fill" aria-hidden="true"></i>${product.rating}</span>
        </div>
      </div>
    </a>`;
}
