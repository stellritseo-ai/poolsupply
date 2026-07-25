/**
 * clean_catalog_json.js
 * Strips all undefined / null spec values from catalog-products.json
 * so TypeScript is happy with Record<string, string>
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../src/lib/catalog-products.json");
const raw = fs.readFileSync(filePath, "utf8");
const products = JSON.parse(raw);

let cleaned = 0;

const result = products.map((p) => {
  if (p.specs && typeof p.specs === "object") {
    const cleanSpecs = {};
    for (const [k, v] of Object.entries(p.specs)) {
      if (v !== undefined && v !== null) {
        cleanSpecs[k] = String(v);
      }
    }
    if (Object.keys(cleanSpecs).length !== Object.keys(p.specs).length) cleaned++;
    return { ...p, specs: cleanSpecs };
  }
  return p;
});

fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
console.log("Cleaned " + cleaned + " products with undefined spec values.");
console.log("Total products written: " + result.length);
