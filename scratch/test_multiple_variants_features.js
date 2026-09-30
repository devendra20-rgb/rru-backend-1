const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../backend/.env.test') });

async function testMultipleVariants() {
  const { connectDB, disconnectDB } = require('../backend/dist/database/mongodb');
  await connectDB();

  const { Variant } = require('../backend/dist/modules/catalog/variants/variant.model');
  const { variantFeatureRepository } = require('../backend/dist/modules/catalog/features/feature.repository');

  const variants = await Variant.find({ 'features.standard.0': { $exists: true } }).limit(5).lean();

  console.log(`Found ${variants.length} sample variants to test:`);

  for (const v of variants) {
    const vId = v._id.toString();
    const result = await variantFeatureRepository.findByVariantId(vId);

    const std = result.filter(f => f.availability === 'standard');
    const opt = result.filter(f => f.availability === 'optional');
    const unavail = result.filter(f => f.availability === 'unavailable');

    console.log(`\nVariant: "${v.name}" (${vId})`);
    console.log(`  Embedded standard array length: ${v.features?.standard?.length || 0}`);
    console.log(`  Embedded optional array length: ${v.features?.optional?.length || 0}`);
    console.log(`  API Standard returned: ${std.length}`);
    console.log(`  API Optional returned: ${opt.length}`);
    console.log(`  API Derived Unavailable returned: ${unavail.length}`);
    console.log(`  Total returned: ${result.length} (Expected: 396 master features)`);

    if (result.length === 396 && std.length === (v.features?.standard?.length || 0)) {
      console.log('  ✓ 100% MATCH!');
    } else {
      console.error('  ✕ MISMATCH DETECTED!');
    }
  }

  await disconnectDB();
}

testMultipleVariants().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
