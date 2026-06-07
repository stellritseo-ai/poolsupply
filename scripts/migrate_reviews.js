import { MongoClient } from "mongodb";

async function migrateReviews() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db("aquapro"); // Using the same database name as in db.ts
  const productsCol = db.collection("products");
  const reviewsCol = db.collection("reviews");
  
  console.log("Fetching products...");
  const products = await productsCol.find({}).toArray();
  
  let insertedCount = 0;
  
  for (const product of products) {
    if (product.reviews && Array.isArray(product.reviews)) {
      for (const review of product.reviews) {
        try {
          // Check if review already exists to avoid duplicates
          const existing = await reviewsCol.findOne({ id: review.id });
          if (!existing) {
            const standaloneReview = {
              ...review,
              productId: product._id.toString()
            };
            
            // Set _id correctly if it isn't an ObjectId already
            standaloneReview._id = standaloneReview.id;
            
            await reviewsCol.insertOne(standaloneReview);
            insertedCount++;
            console.log(`Migrated review ${review.id} for product ${product.name}`);
          }
        } catch (e) {
          console.error(`Failed to migrate review ${review.id}:`, e.message);
        }
      }
    }
  }
  
  console.log(`Migration complete! Successfully copied ${insertedCount} product reviews to the 'reviews' collection.`);
  
  await client.close();
}

migrateReviews().catch(console.error);
