import { MongoClient } from "mongodb";
// Load .env file manually
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

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected.");
    const db = client.db("aquapro");
    const collection = db.collection("products");

    console.log("Fetching products missing MPN or Details...");

    // Find all products that need fixing
    const query = {
      $or: [
        { "specs.MPN": { $exists: false } },
        { "specs.MPN": null },
        { "specs.MPN": "" },
        { details: { $exists: false } },
        { details: null },
        { details: "" },
      ],
    };

    const cursor = collection.find(query);
    const operations = [];
    let count = 0;

    for await (const doc of cursor) {
      count++;
      const updates = {};
      
      // Fix MPN
      const hasMpn = doc.specs && doc.specs.MPN && doc.specs.MPN.trim() !== "";
      if (!hasMpn && doc.sku) {
        updates["specs.MPN"] = doc.sku;
      }

      // Fix details
      const hasDetails = doc.details && typeof doc.details === "string" && doc.details.trim().length >= 20;
      if (!hasDetails) {
        const brand = doc.brand || "Pool Supply Wholesalers";
        const category = doc.category || "pool equipment";
        const name = doc.name || "Replacement Part";
        updates["details"] = `The ${brand} ${name} is a premium replacement part designed for ${category}. This product ensures maximum durability, efficiency, and reliability for your pool system.`;
      }

      if (Object.keys(updates).length > 0) {
        operations.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: updates },
          },
        });
      }
    }

    console.log(`Found ${count} products to inspect.`);
    console.log(`Generated ${operations.length} update operations.`);

    if (operations.length > 0) {
      console.log("Executing bulkWrite...");
      
      // Execute in batches to not overwhelm memory/mongo
      const batchSize = 1000;
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        const result = await collection.bulkWrite(batch, { ordered: false });
        console.log(`Batch ${i / batchSize + 1}: Modified ${result.modifiedCount} documents.`);
      }
      console.log("All updates completed successfully.");
    } else {
      console.log("No updates were necessary.");
    }
  } catch (err) {
    console.error("Fatal error:", err);
  } finally {
    await client.close();
    console.log("Disconnected.");
  }
}

run();
