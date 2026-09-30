const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

async function inspectColors() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log(`Connected to: "${db.databaseName}"`);
  if (db.databaseName !== 'rideroundup_test') {
    console.error('Safety violation');
    process.exit(1);
  }

  // 1. Inspect legacy variantcolors
  const sampleLegacyVC = await db.collection('variantcolors').findOne({});
  console.log('\nLegacy VariantColor sample document fields:', Object.keys(sampleLegacyVC));
  console.log('Legacy VariantColor sample:', sampleLegacyVC);

  // 2. Inspect embedded colors on a variant
  const variantId = '6aafe13eff2841e08feb06f5'; // A3 35 TFSI Advanced
  const variant = await db.collection('variants').findOne({ _id: new mongoose.Types.ObjectId(variantId) });
  console.log(`\nEmbedded colors on variant "${variant.name}":`, variant.colors);

  // 3. Test variantColorRepository.findByVariantId
  const { variantColorRepository } = require('../backend/dist/modules/catalog/colors/color.repository');
  const repoColors = await variantColorRepository.findByVariantId(variantId);
  console.log('\nRepository findByVariantId returned:', JSON.stringify(repoColors, null, 2));

  await mongoose.disconnect();
}

inspectColors().catch(err => {
  console.error(err);
  process.exit(1);
});
