import { getProductsDb } from './src/lib/api/products.functions.ts';
import { connectDB } from './src/lib/db.ts';

async function test() {
  await connectDB();
  const res = await getProductsDb();
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
test().catch(console.error);
