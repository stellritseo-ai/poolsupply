import { connectDB } from './src/lib/db.ts';

async function test() {
  const db = await connectDB();
  const docs = await db.collection('products').find().toArray();
  const objIdDocs = docs.filter(d => typeof d._id === 'object');
  console.dir(objIdDocs, { depth: null });
  process.exit(0);
}
test().catch(e => { console.error(e); process.exit(1); });
