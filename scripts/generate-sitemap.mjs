import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(process.cwd(), "public");
const CATALOG_PATH = path.join(process.cwd(), "src/lib/catalog-products.json");
const BASE_URL = "https://poolsupplywholesalers.com";
const TODAY = new Date().toISOString().split("T")[0];

console.log("Generating sitemaps...");

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractSlugsFromTs(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = [...content.matchAll(/slug:\s*["']([^"']+)["']/g)].map((m) => m[1]);
  return [...new Set(matches.filter((s) => s !== "string"))];
}

// 1. Generate static pages (canonical, no 301s, no 404s)
const pages = [
  { path: "", changefreq: "daily", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/why-us", changefreq: "monthly", priority: "0.8" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "monthly", priority: "0.8" },
  { path: "/finder", changefreq: "weekly", priority: "0.8" },
  { path: "/hubs", changefreq: "weekly", priority: "0.8" },
  { path: "/hubs/nashville-tn", changefreq: "weekly", priority: "0.8" },
  { path: "/hubs/dallas-tx", changefreq: "weekly", priority: "0.8" },
  { path: "/hubs/orlando-fl", changefreq: "weekly", priority: "0.8" },
  { path: "/hubs/los-angeles-ca", changefreq: "weekly", priority: "0.8" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.5" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.5" },
];

const pagesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-pages.xml"), pagesXml);
console.log(`Saved sitemap-pages.xml (${pages.length} URLs)`);

// 2. Read catalog & generate categories and brands
let products = [];
try {
  const rawData = fs.readFileSync(CATALOG_PATH, "utf-8");
  products = JSON.parse(rawData);
  console.log(`Loaded ${products.length} products`);
} catch (err) {
  console.error("Failed to read catalog products:", err);
}

const categories = new Set();
const brands = new Set();
const brandCategoryPairs = new Map();

products.forEach((p) => {
  if (p.category) {
    const catSlug = p.category
      .toLowerCase()
      .replace(/\s+&\s+/g, "-and-")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    categories.add(catSlug);

    if (p.brand) {
      const brandSlug = p.brand.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      brands.add(brandSlug);

      const pairKey = `${brandSlug}:::${catSlug}`;
      if (brandCategoryPairs.has(pairKey)) {
        brandCategoryPairs.get(pairKey).count += 1;
      } else {
        brandCategoryPairs.set(pairKey, { brandSlug, catSlug, count: 1 });
      }
    }
  } else if (p.brand) {
    brands.add(p.brand.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
  }
});

categories.add("all"); // Master catalog category

const catBrandXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Top Category Hubs -->
${Array.from(categories)
  .map(
    (cat) => `  <url>
    <loc>${BASE_URL}/shop/${encodeURIComponent(cat)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
  )
  .join("\n")}

  <!-- Top Brand Hubs -->
${Array.from(brands)
  .map(
    (brand) => `  <url>
    <loc>${BASE_URL}/brands/${encodeURIComponent(brand)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}

  <!-- Long-Tail Brand + Category Landing Hubs (SEO Silo) -->
${Array.from(brandCategoryPairs.values())
  .map(
    (pair) => `  <url>
    <loc>${BASE_URL}/brands/${encodeURIComponent(pair.brandSlug)}/${encodeURIComponent(pair.catSlug)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-categories.xml"), catBrandXml);
console.log(`Saved sitemap-categories.xml (${categories.size} categories, ${brands.size} brands, ${brandCategoryPairs.size} brand-category hubs)`);

// 3. Generate products sitemap with Google Image extension
const productsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products
  .map((p) => {
    let imageXml = "";
    if (p.img && typeof p.img === "string") {
      const imgUrl = p.img.startsWith("http") ? p.img : `${BASE_URL}${p.img.startsWith("/") ? "" : "/"}${p.img}`;
      imageXml = `
    <image:image>
      <image:loc>${escapeXml(imgUrl)}</image:loc>
      <image:title>${escapeXml(p.name || "Pool Equipment")}</image:title>
    </image:image>`;
    }
    return `  <url>
    <loc>${BASE_URL}/products/${escapeXml(p.id)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>${imageXml}
  </url>`;
  })
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-products.xml"), productsXml);
console.log(`Saved sitemap-products.xml (${products.length} products)`);

// 4. Generate blog, buying guides, and comparison articles
const blogSlugs = extractSlugsFromTs(path.join(process.cwd(), "src/lib/blog-content.ts"));
const guideSlugs = extractSlugsFromTs(path.join(process.cwd(), "src/lib/guides-content.ts"));
const comparisonSlugs = extractSlugsFromTs(path.join(process.cwd(), "src/lib/comparisons-content.ts"));

console.log(`Found ${blogSlugs.length} blog articles, ${guideSlugs.length} guides, ${comparisonSlugs.length} comparisons`);

const articlesXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Hub Landing Pages -->
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
  <url>
    <loc>${BASE_URL}/comparisons</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- In-Depth Blog Articles & Reports -->
${blogSlugs
  .map(
    (slug) => `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}

  <!-- Buying Guides -->
${guideSlugs
  .map(
    (slug) => `  <url>
    <loc>${BASE_URL}/guides/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}

  <!-- Head-to-Head Comparisons -->
${comparisonSlugs
  .map(
    (slug) => `  <url>
    <loc>${BASE_URL}/comparisons/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap-blog.xml"), articlesXml);
console.log(`Saved sitemap-blog.xml (${blogSlugs.length + guideSlugs.length + comparisonSlugs.length + 3} URLs)`);

// 5. Generate Master Sitemap Index
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

fs.writeFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), sitemapIndex);
console.log("Master sitemap index generated successfully!");
