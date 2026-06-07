import { MongoClient } from "mongodb";

async function checkOrders() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("aquapro");
  const orders = await db.collection("orders").find().toArray();
  console.log("Orders count:", orders.length);
  if (orders.length > 0) {
    console.log("First order _id type:", typeof orders[0]._id, "value:", orders[0]._id);
  }
  await client.close();
}

checkOrders().catch(console.error);
