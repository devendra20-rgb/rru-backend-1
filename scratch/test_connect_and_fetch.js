const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

async function testFetch() {
  const { connectDB, disconnectDB } = require('../backend/dist/database/mongodb');
  await connectDB();

  const { variantFeatureRepository } = require('../backend/dist/modules/catalog/features/feature.repository');

  const variantId = '6aafe13eff2841e08feb06f5';
  console.log(`Fetching variant features for ${variantId}...`);
  const result = await variantFeatureRepository.findByVariantId(variantId);

  console.log(`\nSUCCESS! Total feature records returned: ${result.length}`);

  const std = result.filter(f => f.availability === 'standard');
  const opt = result.filter(f => f.availability === 'optional');
  const unavail = result.filter(f => f.availability === 'unavailable');

  console.log(`Standard: ${std.length}`);
  console.log(`Optional: ${opt.length}`);
  console.log(`Unavailable: ${unavail.length}`);

  if (result.length > 0) {
    console.log('Sample feature:', {
      _id: result[0]._id,
      variantId: result[0].variantId,
      featureIdName: result[0].featureId?.name,
      featureIdCategory: result[0].featureId?.category,
      availability: result[0].availability,
    });
  }

  await disconnectDB();
}

testFetch().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
