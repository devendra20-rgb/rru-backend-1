const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

const uri = process.env.MONGODB_URI;

async function checkBug() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`Connected to: "${db.databaseName}"`);

  if (db.databaseName !== 'rideroundup_test') {
    console.error('Safety violation!');
    process.exit(1);
  }

  const variantId = '6aafe13eff2841e08feb06f5';
  const variant = await db.collection('variants').findOne({ _id: new mongoose.Types.ObjectId(variantId) });

  console.log(`\nVariant found: ${variant ? variant.name : 'NONE'}`);
  if (variant) {
    console.log(`  - Standard features count: ${variant.features?.standard?.length || 0}`);
    console.log(`  - Optional features count: ${variant.features?.optional?.length || 0}`);
    console.log(`  - Total features embedded: ${(variant.features?.standard?.length || 0) + (variant.features?.optional?.length || 0)}`);
  }

  // Master features check
  const masterFeatures = await db.collection('features').find({ status: 'active' }).toArray();
  console.log(`Master active features in database: ${masterFeatures.length}`);

  const sampleFeature = masterFeatures[0];
  console.log('Sample Master Feature fields:', Object.keys(sampleFeature));
  console.log('Sample Master Feature category:', sampleFeature.category);

  await mongoose.disconnect();
}

checkBug().catch(err => {
  console.error(err);
  process.exit(1);
});
