const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("ERROR: MONGODB_URI environment variable is not defined.");
  process.exit(1);
}

async function clearProducts() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db('aquapro');
    const productsCol = db.collection('products');
    const result = await productsCol.deleteMany({});
    console.log(`SUCCESS: Deleted ${result.deletedCount} products from MongoDB 'aquapro.products' collection.`);
  } catch (err) {
    console.error("Error deleting products:", err);
  } finally {
    await client.close();
  }
}

clearProducts();
