import { MongoClient, ObjectId } from "mongodb";

async function test() {
  const uri = process.env.MONGODB_URI || "mongodb+srv://dmanafb84:wQnL70v3hR@poolsby.e0vme.mongodb.net/?retryWrites=true&w=majority&appName=poolsby";
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("poolsby");
  const collection = db.collection("products");

  const productId = "p-polaris-123"; // just finding any product id

  const doc = await collection.findOne({});
  console.log("Found product:", doc._id);

  const res = await collection.updateOne(
    { _id: doc._id },
    {
      $push: {
        reviews: {
          $each: [{ id: "test", author: "test" }],
          $position: 0
        }
      }
    }
  );

  console.log("Update result:", res);

  const docAfter = await collection.findOne({ _id: doc._id });
  console.log("After update reviews count:", docAfter.reviews?.length);

  await client.close();
}

test().catch(console.error);
