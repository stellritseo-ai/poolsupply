import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src/lib/catalog-products.json");
const BACKUP_PATH = path.join(process.cwd(), "src/lib/catalog-products.backup.json");

if (!fs.existsSync(CATALOG_PATH)) {
  console.error("Error: catalog-products.json not found at", CATALOG_PATH);
  process.exit(1);
}

const raw = fs.readFileSync(CATALOG_PATH, "utf-8");
const products = JSON.parse(raw);

// Create backup before modifying
if (!fs.existsSync(BACKUP_PATH)) {
  fs.writeFileSync(BACKUP_PATH, raw);
  console.log(`Created backup at: ${BACKUP_PATH}`);
}

const ACRONYMS = new Set([
  "LED", "UV", "HP", "VSP", "GPM", "PSI", "NPT", "CPVC", "PVC", "GFCI", "OEM", "DE",
  "KW", "BTU", "VGB", "ADA", "ORP", "PPM", "RPM", "AC", "DC", "SS", "OD", "ID", "AMP",
  "FLG", "V", "HZ", "UL", "ETL", "NSF", "ANSI", "ASME", "MPN", "SKU", "RS485", "WIFI",
  "LAN", "USB", "IC20", "IC40", "IC60", "T-CELL-15", "T-CELL-9", "T-CELL-3", "SWG", "VS"
]);

const LOWERCASE_WORDS = new Set(["and", "or", "for", "with", "in", "on", "at", "to", "a", "an", "the", "of", "by", "w/"]);

function formatTitle(name) {
  if (!name) return "";
  
  let cleaned = name
    .replace(/\bGOVENER\b/g, "GOVERNOR")
    .replace(/\bgovener\b/g, "governor")
    .replace(/\bEQUIPMNET\b/g, "EQUIPMENT")
    .replace(/\bequipmnet\b/g, "equipment")
    .replace(/\s+/g, " ")
    .trim();
  
  // If not all-caps, preserve existing casing with typo fixes
  if (cleaned !== cleaned.toUpperCase()) {
    return cleaned;
  }
  
  const words = cleaned.split(/(\s+|-|\/|\(|\))/);
  const formatted = words.map((token, index, arr) => {
    if (/^(\s+|-|\/|\(|\))$/.test(token) || !token) return token;
    const upper = token.toUpperCase();
    if (ACRONYMS.has(upper)) return upper;
    if (/^\d+(\.\d+)?(KW|HP|GPM|PSI|IN|FT|K|V|A|OZ|LB|GAL|M)$/i.test(token)) {
      return token.toUpperCase();
    }
    const lower = token.toLowerCase();
    const isFirstOrLast = index === 0 || index === arr.length - 1;
    if (!isFirstOrLast && LOWERCASE_WORDS.has(lower)) {
      return lower;
    }
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  });
  return formatted.join("");
}

function buildCleanDescription(p, formattedName) {
  const brand = p.brand && p.brand !== "Generic" ? p.brand : null;
  const sku = p.sku || p.specs?.MPN || null;
  const cat = p.category || "pool equipment";
  
  // Check if existing description was custom or one of the spun openers
  const desc = p.description || "";
  const isSpun =
    desc.startsWith("Experience the difference") ||
    desc.startsWith("Introducing the") ||
    desc.startsWith("Upgrade your") ||
    desc.startsWith("Keep your system") ||
    desc.startsWith("Looking for a") ||
    desc.startsWith("Optimize your aquatic") ||
    /\bnan\b/i.test(desc);

  if (!isSpun && desc.length > 80) {
    // Keep custom description but clean any "nan"
    return desc
      .replace(/\bthe nan\b/gi, "the OEM-spec")
      .replace(/\bchoose nan for\b/gi, "choose our tested replacement parts for")
      .replace(/\bswimming pool nan parts\b/gi, "swimming pool replacement parts")
      .replace(/\bnan (heaters|pumps|filters|cleaners|lights|parts|motors|valves)\b/gi, "$1 replacement parts")
      .replace(/\bmanufactured by nan\b/gi, "manufactured to OEM specifications")
      .replace(/\bwith nan\b/gi, "with commercial-grade components")
      .replace(/\bnan\b/gi, "OEM-spec");
  }

  // Construct high-quality, professional e-commerce description
  let lead = "";
  const nameAlreadyHasBrand = brand && formattedName.toLowerCase().startsWith(brand.toLowerCase());
  const fullName = nameAlreadyHasBrand ? formattedName : brand ? `${brand} ${formattedName}` : formattedName;

  if (brand) {
    lead = `The ${fullName}${sku ? ` (Model / SKU #${sku})` : ""} is a commercial-grade aquatic component engineered for high-performance ${cat.toLowerCase()} systems.`;
  } else {
    lead = `The ${fullName}${sku ? ` (Model / SKU #${sku})` : ""} is an authentic OEM-specification replacement component designed for reliable fit and longevity in ${cat.toLowerCase()} applications.`;
  }

  let detailSentence = "";
  if (p.details && p.details !== p.name && p.details !== formattedName) {
    let cleanDet = p.details.replace(/^.*?\s*-\s*/, "").trim();
    cleanDet = cleanDet.replace(/\bGOVENER\b/gi, "Governor").replace(/\bEQUIPMNET\b/gi, "Equipment");
    if (cleanDet && cleanDet.toLowerCase() !== formattedName.toLowerCase()) {
      detailSentence = ` Manufactured to strict tolerances (${cleanDet}), this unit ensures hydraulic balance and seamless system integration.`;
    }
  }

  const durability = ` Built to withstand continuous pool operation, heavy chemical exposure, and diverse weather conditions.`;
  const wholesaleNote = ` Offered at direct wholesale trade pricing and eligible for fast, 100% free freight shipping nationwide from US regional distribution centers.`;

  return `${lead}${detailSentence}${durability}${wholesaleNote}`;
}

function buildCleanKeywords(p, formattedName) {
  const brand = p.brand && p.brand !== "Generic" ? p.brand.toLowerCase() : "";
  const sku = (p.sku || p.specs?.MPN || "").toLowerCase();
  const cat = (p.category || "pool equipment").toLowerCase();
  const name = formattedName.toLowerCase();
  
  const tokens = [];
  if (brand && sku) tokens.push(`${brand} ${sku}`);
  if (sku) tokens.push(sku);
  tokens.push(name);
  if (brand) tokens.push(`${brand} ${cat}`);
  tokens.push(`commercial ${cat}`);
  tokens.push(`wholesale ${cat} usa`);
  tokens.push(`buy ${sku || name} online`);
  tokens.push("wholesale pool supplies");

  const cleaned = [];
  const seen = new Set();
  for (const t of tokens) {
    const norm = t.replace(/\bnan\b/gi, "").replace(/\s+/g, " ").trim();
    if (norm && !seen.has(norm) && norm.length > 2) {
      seen.add(norm);
      cleaned.push(norm);
    }
  }
  return cleaned.slice(0, 7).join(", ");
}

let fixedCapsCount = 0;
let fixedNanCount = 0;

const cleanedProducts = products.map((p) => {
  const originalName = p.name || "";
  const formattedName = formatTitle(originalName);
  
  if (originalName !== formattedName) {
    fixedCapsCount++;
  }
  
  const originalDesc = p.description || "";
  const originalKw = p.seoKeywords || "";
  if (/\bnan\b/i.test(originalDesc) || /\bnan\b/i.test(originalKw)) {
    fixedNanCount++;
  }

  const cleanDesc = buildCleanDescription(p, formattedName);
  const cleanKw = buildCleanKeywords(p, formattedName);

  return {
    ...p,
    name: formattedName,
    description: cleanDesc,
    seoKeywords: cleanKw,
  };
});

fs.writeFileSync(CATALOG_PATH, JSON.stringify(cleanedProducts, null, 2));

console.log(`\nCatalog Cleaning Completed:`);
console.log(`- Total products processed: ${cleanedProducts.length}`);
console.log(`- Formatted all-caps / typo names: ${fixedCapsCount}`);
console.log(`- Eliminated 'nan' occurrences: ${fixedNanCount}`);
console.log(`- Updated: ${CATALOG_PATH}`);
