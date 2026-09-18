import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const CATALOG_PATH = path.join(process.cwd(), 'src/lib/catalog-products.json');
const BASE_URL = 'https://www.poolsupplywholesalers.com';
const TODAY = new Date().toISOString().split('T')[0];

console.log('Generating sitemaps...');

// Read catalog
const rawData = fs.readFileSync(CATALOG_PATH, 'utf-8');
const products = JSON.parse(rawData);
console.log(`Loaded ${products.length} products`);

// Generate static pages
const pages = [
  '',
  '/about',
  '/contact',
  '/policies',
  '/terms',
  '/privacy',
  '/finder',
];

const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-pages.xml'), pagesXml);

// Generate categories and brands
const categories = new Set();
const brands = new Set();
products.forEach(p => {
  if (p.category) categories.add(p.category.toLowerCase().replace(/\s+&\s+/g, '-and-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  if (p.brand) brands.add(p.brand.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
});

categories.add('all'); // Add the main shop route

const catBrandXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${Array.from(categories).map(cat => `
  <url>
    <loc>${BASE_URL}/shop/${cat}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
  ${Array.from(brands).map(brand => `
  <url>
    <loc>${BASE_URL}/brands/${brand}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-categories.xml'), catBrandXml);

// Generate products sitemap (can handle up to 50k URLs per file, we have ~8k so one file is fine)
const productsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products.map(p => `
  <url>
    <loc>${BASE_URL}/products/${p.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-products.xml'), productsXml);

// Generate blog/guides/comparisons
// In a real build, we'd read from the TS files, but for the script we'll use the known slugs
const guideSlugs = [
  "pool-pump-buying-guide",
  "pool-heater-buying-guide",
  "pool-filter-buying-guide",
  "pool-automation-buying-guide",
  "salt-chlorine-generator-buying-guide",
  "commercial-pool-equipment-guide"
];

const comparisonSlugs = [
  "pentair-vs-hayward-pool-pumps",
  "gas-vs-electric-pool-heaters",
  "cartridge-vs-sand-pool-filters",
  "jandy-vs-pentair-pool-heaters",
  "variable-speed-vs-single-speed-pool-pumps"
];

const articlesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/guides</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${guideSlugs.map(slug => `
  <url>
    <loc>${BASE_URL}/guides/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  <url>
    <loc>${BASE_URL}/comparisons</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${comparisonSlugs.map(slug => `
  <url>
    <loc>${BASE_URL}/comparisons/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-blog.xml'), articlesXml);

// Generate sitemap index
const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-products.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blog.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapIndex);

console.log('Sitemaps generated successfully!');
