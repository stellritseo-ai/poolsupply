import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dns from "node:dns";

try {
  if (typeof dns?.setServers === "function") {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
  }
} catch {}

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
      }
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined.");
  process.exit(1);
}

const CATALOG_PATH = path.join(process.cwd(), "src/lib/catalog-products.json");
const products = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));

async function sync() {
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected.");
    const db = client.db("aquapro");
    const collection = db.collection("products");

    console.log(`Preparing bulk sync for ${products.length} catalog products...`);
    const operations = products.map((p) => ({
      updateOne: {
        filter: { id: p.id },
        update: {
          $set: {
            name: p.name,
            description: p.description,
            seoKeywords: p.seoKeywords,
          },
        },
      },
    }));

    const batchSize = 500;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const res = await collection.bulkWrite(batch);
      console.log(`Synced batch ${i / batchSize + 1} (${res.modifiedCount} modified, ${res.matchedCount} matched).`);
    }

    console.log("Database synchronization complete!");
  } catch (err) {
    console.error("MongoDB sync error:", err.message);
  } finally {
    await client.close();
  }
}

sync();
