#!/usr/bin/env node
/**
 * YagnaArts static site builder.
 *
 * Zero dependencies (Node core only) by design — this project is a static
 * HTML/CSS/vanilla-JS site, and the build step exists purely to (a) inline
 * shared header/footer/mobile-menu components into every page and (b)
 * pre-render one real, crawlable static HTML file per product/collection/
 * blog post from the JSON catalog — see docs/phase-7-folder-structure.md
 * for the architecture decision behind this instead of client-side rendering.
 *
 * What it does, each run:
 *   1. Loads shared fragments from /src/components/*.html
 *   2. Renders every /src/pages/**\/*.html by resolving <!-- include:name -->
 *      markers, writing output to the mirrored path at the project root
 *      (src/pages/home.html -> /index.html, src/pages/about.html -> /pages/about.html)
 *   3. Renders /src/templates/product.template.html once per entry in
 *      data/products.json -> /product/{slug}/index.html
 *   4. Renders /src/templates/collection.template.html once per entry in
 *      data/collections.json -> /collections/{slug}/index.html
 *   5. Renders /src/templates/blog-post.template.html once per entry in
 *      data/blog-posts.json (if present) -> /blog/{slug}/index.html
 *   6. Writes /sitemap.xml listing every generated + known static URL
 *
 * Templates that don't exist yet are skipped with a console notice rather
 * than failing the build — this lets the script run safely from Phase 7
 * onward, before Phase 8/9 have authored the actual template markup.
 *
 * Usage:  node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_COMPONENTS = path.join(ROOT, 'src', 'components');
const SRC_TEMPLATES = path.join(ROOT, 'src', 'templates');
const SRC_PAGES = path.join(ROOT, 'src', 'pages');
const DATA_DIR = path.join(ROOT, 'data');
const SITE_URL = 'https://yagnasrireddymukku.github.io/yagnaarts'; // update once the real domain is chosen (Phase 15)

const generatedUrls = [];

function log(msg) {
  console.log(`[build] ${msg}`);
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function readJson(name) {
  const p = path.join(DATA_DIR, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/* ---------------------------------------------------------------------- *
 * Include resolution: <!-- include:header --> -> contents of header.html
 * ---------------------------------------------------------------------- */
function loadComponents() {
  const components = {};
  if (!fs.existsSync(SRC_COMPONENTS)) return components;
  for (const file of fs.readdirSync(SRC_COMPONENTS)) {
    if (!file.endsWith('.html')) continue;
    const name = path.basename(file, '.html');
    components[name] = fs.readFileSync(path.join(SRC_COMPONENTS, file), 'utf8');
  }
  return components;
}

function resolveIncludes(html, components, seen = new Set()) {
  return html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (match, name) => {
    if (seen.has(name)) {
      throw new Error(`Circular include detected for "${name}"`);
    }
    const fragment = components[name];
    if (fragment === undefined) {
      log(`WARNING: no component found for include:${name} — leaving marker as a visible TODO`);
      return `<!-- MISSING COMPONENT: ${name} -->`;
    }
    return resolveIncludes(fragment, components, new Set(seen).add(name));
  });
}

/* ---------------------------------------------------------------------- *
 * Minimal mustache-style templating for data-driven pages
 * Supports: {{key}}, {{a.b}}, {{#each arr}}...{{/each}} (with {{@index}},
 * {{this}}, and {{this.field}} inside), {{#if key}}...{{/if}}
 * ---------------------------------------------------------------------- */
function getPath(obj, keyPath) {
  if (keyPath === 'this') return obj;
  return keyPath.split('.').reduce((acc, key) => {
    if (key.startsWith('this.')) key = key.slice(5);
    return acc == null ? undefined : acc[key];
  }, obj);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTemplate(template, data, depth = 0) {
  if (depth > 12) {
    throw new Error('renderTemplate exceeded max partial-recursion depth (12) — check for a partial referencing itself.');
  }
  let out = template;

  // {{#each field}} ... {{/each}}
  out = out.replace(/{{#each ([\w.]+)}}([\s\S]*?){{\/each}}/g, (match, field, body) => {
    const arr = getPath(data, field);
    if (!Array.isArray(arr)) return '';
    return arr
      .map((item, index) => {
        let block = body.replace(/{{@index}}/g, index);
        // {{> partial-name}} — renders a shared /src/components fragment once
        // per item, with the item itself as the data context (see product-card.html)
        block = block.replace(/{{>\s*([\w-]+)\s*}}/g, (m, name) => {
          const partial = components[name];
          if (partial === undefined) {
            log(`WARNING: no component found for partial {{> ${name}}} — leaving marker as a visible TODO`);
            return `<!-- MISSING PARTIAL: ${name} -->`;
          }
          return renderTemplate(partial, item, depth + 1);
        });
        block = block.replace(/{{this\.([\w.]+)}}/g, (m, key) => {
          const val = getPath(item, key);
          return val === undefined ? '' : escapeHtml(val);
        });
        block = block.replace(/{{this}}/g, escapeHtml(item));
        return block;
      })
      .join('');
  });

  // {{#if field}} ... {{/if}} — an empty array counts as falsy here (unlike
  // plain JS truthiness) so {{#if relatedItems}} correctly hides a section
  // when there's nothing to show, instead of rendering an empty heading.
  out = out.replace(/{{#if ([\w.]+)}}([\s\S]*?){{\/if}}/g, (match, field, body) => {
    const val = getPath(data, field);
    const truthy = Array.isArray(val) ? val.length > 0 : Boolean(val);
    return truthy ? body : '';
  });

  // {{> partial-name}} at the top level (outside any #each), rendered against
  // the current full data context
  out = out.replace(/{{>\s*([\w-]+)\s*}}/g, (match, name) => {
    const partial = components[name];
    if (partial === undefined) {
      log(`WARNING: no component found for partial {{> ${name}}} — leaving marker as a visible TODO`);
      return `<!-- MISSING PARTIAL: ${name} -->`;
    }
    return renderTemplate(partial, data, depth + 1);
  });

  // {{{rawField}}} — unescaped
  out = out.replace(/{{{([\w.]+)}}}/g, (match, field) => {
    const val = getPath(data, field);
    return val === undefined ? '' : val;
  });

  // {{field}} — escaped
  out = out.replace(/{{([\w.]+)}}/g, (match, field) => {
    const val = getPath(data, field);
    return val === undefined ? '' : escapeHtml(val);
  });

  return out;
}

/* ---------------------------------------------------------------------- *
 * Step 1: shared components
 * ---------------------------------------------------------------------- */
const components = loadComponents();
log(`Loaded ${Object.keys(components).length} shared component(s): ${Object.keys(components).join(', ') || '(none yet)'}`);

/* ---------------------------------------------------------------------- *
 * Shared data context, available to every page (not just generated ones)
 * so hand-authored pages like the homepage can use {{#each trendingProducts}}
 * etc. instead of re-fetching JSON client-side just to render a product row.
 * ---------------------------------------------------------------------- */
const productsData = readJson('products.json');
const collectionsData = readJson('collections.json');
const testimonialsData = readJson('testimonials.json');
const faqData = readJson('faq.json');
const blogData = readJson('blog-posts.json');

const allProducts = productsData?.products || [];
const inCollection = (slug) => allProducts.filter((p) => p.collections.includes(slug));

// With a small seed catalog, a badge filter alone can return just 1-2
// products — not enough for a believable "Best Sellers" row. curatedList
// always leads with explicitly flagged items, then tops up from the rest
// (sorted by rating) so every homepage row shows a reasonable number of
// products regardless of how many are actually badged yet.
const MAX_ROW = 8;
function curatedList(flagPredicate, fallbackSort) {
  const flagged = allProducts.filter(flagPredicate);
  const flaggedIds = new Set(flagged.map((p) => p.id));
  const rest = allProducts.filter((p) => !flaggedIds.has(p.id)).sort(fallbackSort);
  return [...flagged, ...rest].slice(0, MAX_ROW);
}
const byRatingDesc = (a, b) => b.rating - a.rating;

const siteData = {
  products: allProducts,
  trendingProducts: allProducts.slice(0, MAX_ROW),
  bestSellers: curatedList((p) => p.badge === 'bestseller', byRatingDesc),
  newArrivals: curatedList((p) => p.badge === 'new', byRatingDesc),
  luxuryProducts: inCollection('luxury-collection'),
  weddingProducts: inCollection('wedding-collection'),
  festivalProducts: inCollection('festival-collection'),
  corporateProducts: inCollection('corporate-gifts'),
  personalizedProducts: inCollection('personalized-gifts'),
  collections: collectionsData?.collections || [],
  testimonials: testimonialsData?.testimonials || [],
  faqs: faqData?.faqs || [],
  faqsHome: (faqData?.faqs || []).filter((f) => f.showOnHome),
  blogPosts: blogData?.posts || [],
  site: { year: new Date().getFullYear() },
};

/* ---------------------------------------------------------------------- *
 * Step 2: hand-authored pages in /src/pages -> mirrored output paths
 * ---------------------------------------------------------------------- */
function walkPages(dir, base = '') {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkPages(abs, rel));
    } else if (entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

const pageFiles = walkPages(SRC_PAGES);
if (pageFiles.length === 0) {
  log('No hand-authored pages in /src/pages yet — nothing to render (expected until Phase 8/9).');
}

for (const rel of pageFiles) {
  const srcPath = path.join(SRC_PAGES, rel);
  const raw = fs.readFileSync(srcPath, 'utf8');
  const rendered = renderTemplate(resolveIncludes(raw, components), siteData);

  // A few page sources map to clean URLs outside /pages/ instead of the
  // default 1:1 mirror — home is the site root, blog gets its own index.
  const SPECIAL_OUTPUT_PATHS = {
    'home.html': 'index.html',
    'blog.html': path.join('blog', 'index.html'),
    // GitHub Pages / Netlify / Cloudflare Pages all look for /404.html at
    // the true site root by convention to serve as the not-found handler.
    '404.html': '404.html',
  };
  const outRel = SPECIAL_OUTPUT_PATHS[rel] || path.join('pages', rel);
  const outPath = path.join(ROOT, outRel);
  ensureDirFor(outPath);
  fs.writeFileSync(outPath, rendered, 'utf8');
  // Pages marked noindex (cart/checkout/wishlist/search — real content only
  // once a visitor has personal state) are still written normally, just
  // left out of the sitemap, which should only list indexable URLs.
  if (!/<meta name="robots" content="noindex">/.test(rendered)) {
    generatedUrls.push('/' + outRel.replace(/\\/g, '/').replace(/index\.html$/, ''));
  }
  log(`Rendered ${outRel}`);
}

/* ---------------------------------------------------------------------- *
 * Step 3: product pages
 * ---------------------------------------------------------------------- */
const productTemplate = readIfExists(path.join(SRC_TEMPLATES, 'product.template.html'));

if (!productTemplate) {
  log('No /src/templates/product.template.html yet — skipping product page generation (Phase 9).');
} else if (!productsData || !Array.isArray(productsData.products)) {
  log('No data/products.json found — skipping product page generation.');
} else {
  const withIncludes = resolveIncludes(productTemplate, components);
  const allCollections = collectionsData?.collections || [];
  for (const product of productsData.products) {
    const primaryCollection = allCollections.find((c) => c.slug === product.collections[0]) || null;
    const relatedProducts = productsData.products
      .filter((p) => p.id !== product.id && p.collections.some((c) => product.collections.includes(c)))
      .slice(0, 4);
    const productionLabel =
      (product.productionTime.type === 'made-to-order' ? 'Made to order' : 'Ready to ship') +
      ` — ships in ${product.productionTime.minDays}–${product.productionTime.maxDays} days`;
    const canonicalUrl = `${SITE_URL}/product/${product.slug}/`;
    const availabilitySchema =
      product.availability === 'limited-stock' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock';

    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: 'YagnaArts' },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: product.currency,
          price: product.price,
          availability: availabilitySchema,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE_URL}/pages/shop.html` },
          ...(primaryCollection
            ? [{ '@type': 'ListItem', position: 3, name: primaryCollection.name, item: `${SITE_URL}/collections/${primaryCollection.slug}/` }]
            : []),
          { '@type': 'ListItem', position: primaryCollection ? 4 : 3, name: product.name, item: canonicalUrl },
        ],
      },
    ];
    const productJsonLd = jsonLd.map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join('\n');

    const html = renderTemplate(withIncludes, {
      ...product,
      primaryCollection,
      relatedProducts,
      productionLabel,
      canonicalUrl,
      productJsonLd,
      ogImage: product.images[0],
    });
    const outPath = path.join(ROOT, 'product', product.slug, 'index.html');
    ensureDirFor(outPath);
    fs.writeFileSync(outPath, html, 'utf8');
    generatedUrls.push(`/product/${product.slug}/`);
  }
  log(`Generated ${productsData.products.length} product page(s).`);
}

/* ---------------------------------------------------------------------- *
 * Step 4: collection pages
 * ---------------------------------------------------------------------- */
const collectionTemplate = readIfExists(path.join(SRC_TEMPLATES, 'collection.template.html'));

if (!collectionTemplate) {
  log('No /src/templates/collection.template.html yet — skipping collection page generation (Phase 9).');
} else if (!collectionsData || !Array.isArray(collectionsData.collections)) {
  log('No data/collections.json found — skipping collection page generation.');
} else {
  const withIncludes = resolveIncludes(collectionTemplate, components);
  for (const collection of collectionsData.collections) {
    const productsInCollection = (productsData?.products || []).filter((p) =>
      p.collections.includes(collection.slug)
    );
    const canonicalUrl = `${SITE_URL}/collections/${collection.slug}/`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.name,
        description: collection.description,
        url: canonicalUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE_URL}/pages/shop.html` },
          { '@type': 'ListItem', position: 3, name: collection.name, item: canonicalUrl },
        ],
      },
    ];
    const collectionJsonLd = jsonLd.map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join('\n');
    const html = renderTemplate(withIncludes, {
      ...collection,
      products: productsInCollection,
      canonicalUrl,
      collectionJsonLd,
    });
    const outPath = path.join(ROOT, 'collections', collection.slug, 'index.html');
    ensureDirFor(outPath);
    fs.writeFileSync(outPath, html, 'utf8');
    generatedUrls.push(`/collections/${collection.slug}/`);
  }
  log(`Generated ${collectionsData.collections.length} collection page(s).`);
}

/* ---------------------------------------------------------------------- *
 * Step 5: blog posts
 * ---------------------------------------------------------------------- */
const blogTemplate = readIfExists(path.join(SRC_TEMPLATES, 'blog-post.template.html'));

if (!blogTemplate) {
  log('No /src/templates/blog-post.template.html yet — skipping blog generation (Phase 9).');
} else if (!blogData || !Array.isArray(blogData.posts)) {
  log('No data/blog-posts.json found — skipping blog generation.');
} else {
  const withIncludes = resolveIncludes(blogTemplate, components);
  for (const post of blogData.posts) {
    const relatedPosts = blogData.posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
    const canonicalUrl = `${SITE_URL}/blog/${post.slug}/`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: [post.heroImage],
        datePublished: post.publishDate,
        author: { '@type': 'Person', name: post.author },
        publisher: { '@type': 'Organization', name: 'YagnaArts' },
        description: post.excerpt,
        mainEntityOfPage: canonicalUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog/` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
        ],
      },
    ];
    const blogJsonLd = jsonLd.map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`).join('\n');
    const html = renderTemplate(withIncludes, {
      ...post,
      relatedPosts,
      canonicalUrl,
      blogJsonLd,
    });
    const outPath = path.join(ROOT, 'blog', post.slug, 'index.html');
    ensureDirFor(outPath);
    fs.writeFileSync(outPath, html, 'utf8');
    generatedUrls.push(`/blog/${post.slug}/`);
  }
  log(`Generated ${blogData.posts.length} blog post page(s).`);
}

/* ---------------------------------------------------------------------- *
 * Step 6: sitemap.xml
 * ---------------------------------------------------------------------- */
const staticKnownUrls = ['/'];
const urlSet = Array.from(new Set([...staticKnownUrls, ...generatedUrls])).sort();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlSet.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
log(`Wrote sitemap.xml with ${urlSet.length} URL(s).`);

log('Build complete.');
