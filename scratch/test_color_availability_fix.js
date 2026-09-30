const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

async function testColorFix() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log(`Connected database: "${db.databaseName}"`);
  if (db.databaseName !== 'rideroundup_test') {
    console.error('Safety violation');
    process.exit(1);
  }

  // Fetch variant '6aafe13eff2841e08feb06f5' (A3 35 TFSI Advanced)
  const variantId = '6aafe13eff2841e08feb06f5';
  const variant = await db.collection('variants').findOne({ _id: new mongoose.Types.ObjectId(variantId) });

  console.log(`Variant: "${variant.name}"`);
  console.log('Raw embedded colors in DB:', variant.colors);

  // Compare with legacy variantcolors for this variant
  const legacyColors = await db.collection('variantcolors').find({ variantId: new mongoose.Types.ObjectId(variantId) }).toArray();
  console.log(`Legacy variantcolors count for this variant: ${legacyColors.length}`);
  console.log('Legacy color availabilities:', legacyColors.map(c => ({ colorId: c.colorId, availability: c.availability, status: c.status })));

  await mongoose.disconnect();
}

testColorFix().catch(err => {
  console.error(err);
  process.exit(1);
});
