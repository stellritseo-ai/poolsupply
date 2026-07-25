import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import catalogProducts from '../src/lib/catalog-products.json' with { type: 'json' };

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

loadEnv();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not defined.");
  process.exit(1);
}

async function seed() {
  console.log(`Loaded ${catalogProducts.length} clean products from catalog-products.json.`);

  let client;
  try {
    console.log("Connecting to MongoDB via MONGODB_URI...");
    client = new MongoClient(uri);
    await client.connect();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }

  console.log("🎉 Successfully connected to MongoDB Atlas database 'aquapro'!");
  const db = client.db('aquapro');
  const productsCol = db.collection('products');

  console.log(`Writing all ${catalogProducts.length} items into MongoDB 'products' collection...`);

  const bulkOps = catalogProducts.map(doc => ({
    replaceOne: {
      filter: { _id: doc.id },
      replacement: { ...doc, _id: doc.id },
      upsert: true
    }
  }));

  const batchSize = 1000;
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    const res = await productsCol.bulkWrite(batch);
    console.log(`Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bulkOps.length / batchSize)} processed. Upserted: ${res.upsertedCount}, Modified: ${res.modifiedCount}`);
  }

  const finalCount = await productsCol.countDocuments();
  console.log(`✅ COMPLETE! Total products in MongoDB Atlas 'aquapro' database: ${finalCount}`);
  await client.close();
}

seed().catch(console.error);
