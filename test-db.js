import { MongoClient } from "mongodb";

async function test() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://Pools_database_db_user:pPH0aCfvACpdl0vR@pools.4nsntwy.mongodb.net/?appName=Pools";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("aquapro");
  const products = await db.collection("products").find().toArray();
  console.log("Total products:", products.length);
  
  const testProduct = products.find(p => p.id === "p-logo-1780771051596" || p._id === "p-logo-1780771051596");
  console.log("Test Product:", testProduct);
  await client.close();
}

test().catch(console.error);
