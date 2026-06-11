import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { MongoClient } from 'mongodb';

// Force use of public DNS servers to resolve MongoDB SRV records in environments with restricted local DNS resolvers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn("⚠️ Warning: Could not set public DNS servers:", e.message);
}

// Load environment variables from .env manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

// Clean HTML tags and entities
function cleanHTML(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

// Generate a professional related description if empty or too short
function generateDescription(name, brand, category) {
  const cleanBrand = brand && brand !== 'Generic' ? brand : '';
  const cleanCategory = category 
    ? category.toLowerCase().replace(/s$/, '') // simple singularization
    : 'pool equipment'; 
  
  const templates = [
    `The ${name} is a high-performance ${cleanCategory}${cleanBrand ? ` engineered by ${cleanBrand}` : ''}. Built with premium grade components, it offers exceptional efficiency, reliability, and long-lasting durability for your pool system.`,
    `Optimize your pool setup with the ${name}${cleanBrand ? ` from ${cleanBrand}` : ''}. This professional-grade ${cleanCategory} provides outstanding water circulation and performance you can count on.`,
    `The ${name} is a top-tier ${cleanCategory} designed by ${cleanBrand || 'industry professionals'}. Engineered for quiet and energy-efficient operation, it ensures a clean and sparkling pool all season long.`
  ];
  
  // Use a simple hash of the name to choose a template consistently
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % templates.length;
  return templates[index];
}

// Robust, dependency-free CSV parser
function parseCSV(text) {
  const lines = [];
  let row = [];
  let currentField = '';
  let inQuotes = false;

  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const nextChar = normalizedText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentField.trim());
        currentField = '';
      } else if (char === '\n') {
        row.push(currentField.trim());
        lines.push(row);
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || row.length > 0) {
    row.push(currentField.trim());
    lines.push(row);
  }

  if (lines.length === 0) return [];

  const rawHeaders = lines[0];
  const headers = rawHeaders.map(h => h.replace(/^\uFEFF/, '').trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] !== undefined ? values[idx] : '';
    });
    data.push(rowObj);
  }

  return data;
}

async function migrateWordPress() {
  loadEnv();
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ Error: MONGODB_URI is not defined in your .env file.");
    process.exit(1);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  
  // Look for upload images flag
  const shouldUploadToCloudinary = process.argv.includes('--upload-images');
  const hasCloudinary = !!(cloudName && uploadPreset) && shouldUploadToCloudinary;

  if (hasCloudinary) {
    console.log(`☁️ Cloudinary image uploading enabled.`);
  } else {
    console.log(`ℹ️ Cloudinary uploading disabled. Linking original WordPress URLs directly (or pass '--upload-images' if desired).`);
  }

  const exportFilePath = process.argv.find(arg => arg.endsWith('.csv') || arg.endsWith('.json')) || './products.csv';
  const absolutePath = path.resolve(exportFilePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Error: File not found at ${absolutePath}`);
    console.error(`💡 Tips: Please make sure 'products.csv' is in the root poolsby/ folder.`);
    process.exit(1);
  }

  const fileExt = path.extname(absolutePath).toLowerCase();
  console.log(`📖 Reading file: ${absolutePath}`);

  let rawProducts = [];
  const rawContent = fs.readFileSync(absolutePath, 'utf8');

  if (fileExt === '.csv') {
    try {
      rawProducts = parseCSV(rawContent);
      console.log(`✅ CSV parsed. Found ${rawProducts.length} rows.`);
    } catch (csvErr) {
      console.error("❌ Error parsing CSV file:", csvErr);
      process.exit(1);
    }
  } else {
    try {
      const parsed = JSON.parse(rawContent);
      rawProducts = Array.isArray(parsed) ? parsed : (parsed.products || [parsed]);
      console.log(`✅ JSON parsed. Found ${rawProducts.length} items.`);
    } catch (jsonErr) {
      console.error("❌ Error parsing JSON file:", jsonErr);
      process.exit(1);
    }
  }

  console.log("🔌 Connecting to MongoDB Database...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("aquapro");
  const productsCol = db.collection("products");

  let successCount = 0;
  let cloudinaryUploadCount = 0;
  
  const bulkOps = [];

  console.log("⚙️ Formatting and preparing products bulk write...");

  for (const wpProduct of rawProducts) {
    try {
      const cleanPrice = (priceVal) => {
        if (priceVal === undefined || priceVal === null || priceVal === '') return null;
        const str = String(priceVal).replace(/[^\d.]/g, '');
        return parseFloat(str) || 0;
      };

      const name = wpProduct.Name || wpProduct.name || wpProduct.title || wpProduct.Title || "Unnamed WordPress Product";
      const sku = wpProduct.SKU || wpProduct.sku || `WP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      let id = wpProduct.ID || wpProduct.id || wpProduct.sku || sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
      id = String(id).trim();

      const regularPrice = cleanPrice(wpProduct['Regular price'] || wpProduct.regular_price || wpProduct.price || wpProduct.Price || 0);
      const salePrice = cleanPrice(wpProduct['Sale price'] || wpProduct.sale_price);
      
      let price = regularPrice;
      let msrp = regularPrice;

      if (salePrice !== null && salePrice < regularPrice) {
        price = salePrice;
        msrp = regularPrice;
      } else {
        msrp = regularPrice ? regularPrice * 1.2 : 0;
      }

      let category = "Pool Equipments";
      const categoriesField = wpProduct.Categories || wpProduct.categories || wpProduct.Category || wpProduct.category || '';
      if (categoriesField) {
        const catList = String(categoriesField).split(',');
        const firstCat = catList[0].split('>').pop().trim();
        if (firstCat) category = firstCat;
      }

      const stockField = wpProduct.Stock || wpProduct.stock || wpProduct['Stock quantity'] || wpProduct.stock_quantity || 10;
      const stock = parseInt(stockField) || 10;

      const brand = wpProduct.Brand || wpProduct.Brands || wpProduct.brand || wpProduct.manufacturer || wpProduct.Manufacturer || "Generic";

      // Specs parsing
      const specs = {};
      if (wpProduct.specs && typeof wpProduct.specs === 'object') {
        Object.assign(specs, wpProduct.specs);
      } else {
        for (let idx = 1; idx <= 10; idx++) {
          const attrNameKey = `Attribute ${idx} name`;
          const attrValKey = `Attribute ${idx} value(s)`;
          if (wpProduct[attrNameKey] && wpProduct[attrValKey]) {
            specs[wpProduct[attrNameKey]] = wpProduct[attrValKey];
          }
        }
      }

      // Handle images mapping
      let wpImageUrl = null;
      const imagesField = wpProduct.Images || wpProduct.images || wpProduct.Image || wpProduct.image || wpProduct.image_url || wpProduct.featured_image || '';
      if (imagesField) {
        const urlList = String(imagesField).split(',').map(u => u.trim());
        if (urlList.length > 0 && urlList[0].startsWith('http')) {
          wpImageUrl = urlList[0];
        }
      }

      let imageUrl = "";
      if (wpImageUrl) {
        if (hasCloudinary && wpImageUrl.startsWith("http")) {
          try {
            console.log(`📤 Uploading image for "${name}" to Cloudinary...`);
            const formData = new FormData();
            formData.append("file", wpImageUrl);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "pool-products");
            
            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              { method: "POST", body: formData }
            );
            
            if (response.ok) {
              const result = await response.json();
              imageUrl = result.secure_url;
              cloudinaryUploadCount++;
            } else {
              imageUrl = wpImageUrl;
            }
          } catch (uploadErr) {
            imageUrl = wpImageUrl;
          }
        } else {
          imageUrl = wpImageUrl;
        }
      }

      // 10. Clean / generate description
      let description = cleanHTML(wpProduct.description || wpProduct.Description || wpProduct['Short description'] || wpProduct.short_description || wpProduct.content);
      if (description.length < 15) {
        description = generateDescription(name, brand, category);
      }

      const formattedProduct = {
        _id: id,
        id: id,
        name: name,
        brand: brand,
        price: price,
        msrp: msrp,
        rating: parseFloat(wpProduct.rating || wpProduct.average_rating || wpProduct['Average rating']) || 4.7,
        img: imageUrl,
        sku: sku,
        category: category,
        stock: stock,
        description: description,
        specs: specs,
        reviews: []
      };

      bulkOps.push({
        replaceOne: {
          filter: { _id: id },
          replacement: formattedProduct,
          upsert: true
        }
      });
      
      successCount++;
    } catch (err) {
      console.error(`❌ Error preparing item:`, wpProduct, err);
    }
  }

  // 11. Execute bulk write to MongoDB
  if (bulkOps.length > 0) {
    console.log(`💾 Writing ${bulkOps.length} products to database in bulk batches...`);
    const chunkSize = 1000;
    for (let i = 0; i < bulkOps.length; i += chunkSize) {
      const chunk = bulkOps.slice(i, i + chunkSize);
      await productsCol.bulkWrite(chunk);
      console.log(`   Processed batch ${Math.floor(i / chunkSize) + 1} (${chunk.length} items)...`);
    }
  }

  console.log(`\n🎉 Migration Complete:`);
  console.log(`  - Total products successfully uploaded: ${successCount}`);
  console.log(`  - Cloudinary images uploaded: ${cloudinaryUploadCount}`);
  console.log(`  - Connected DB: aquapro`);
  
  await client.close();
}

migrateWordPress().catch(e => {
  console.error("❌ Fatal migration error:", e);
  process.exit(1);
});
