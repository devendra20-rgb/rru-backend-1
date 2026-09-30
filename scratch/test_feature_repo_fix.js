require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

const mongoose = require('mongoose');

async function testFix() {
  const uri = process.env.MONGODB_URI;
  console.log('Connecting via Mongoose...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected database: "${mongoose.connection.db.databaseName}"`);

  const { variantFeatureRepository } = require('../backend/dist/modules/catalog/features/feature.repository');

  const variantId = '6aafe13eff2841e08feb06f5';
  console.log(`Fetching features for variant ${variantId}...`);
  const result = await variantFeatureRepository.findByVariantId(variantId);

  console.log(`Result total features returned: ${result.length}`);

  const std = result.filter(f => f.availability === 'standard');
  const opt = result.filter(f => f.availability === 'optional');
  const unavail = result.filter(f => f.availability === 'unavailable');

  console.log(`Standard: ${std.length}`);
  console.log(`Optional: ${opt.length}`);
  console.log(`Unavailable: ${unavail.length}`);

  if (std.length === 34 && unavail.length === 362) {
    console.log('✓ SUCCESS: findByVariantId returned exact expected standard (34) and derived unavailable (362) features!');
  } else {
    console.error('✕ MISMATCH in returned features!');
  }

  await mongoose.disconnect();
}

testFix().catch(err => {
  console.error('ERROR in testFix:', err);
  process.exit(1);
});
