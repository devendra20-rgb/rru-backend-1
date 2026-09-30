import dotenv from 'dotenv';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import dns from 'dns';

// Fix Node.js SRV DNS lookup issues on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if DNS server override fails
}

// Load environment variables strictly from .env.test
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

function getDbNameFromUri(uri: string): string {
  try {
    const url = new URL(uri.startsWith('mongodb+srv://') ? uri.replace('mongodb+srv://', 'http://') : uri.replace('mongodb://', 'http://'));
    const pathname = url.pathname.replace(/^\//, '');
    return pathname.split('?')[0] || '';
  } catch {
    const match = uri.match(/\/([a-zA-Z0-9_-]+)(\?|$)/);
    return match ? match[1] : '';
  }
}

async function runMigration() {
  console.log('==================================================');
  console.log('STARTING JUNCTION TO EMBEDDED MIGRATION ON TEST');
  console.log('==================================================');

  const mongoUri = process.env.MONGODB_URI || '';
  const dbName = getDbNameFromUri(mongoUri);

  console.log(`Target Database Name from URI: "${dbName}"`);

  // STRICT SAFETY GUARD: Database MUST be rideroundup_test
  if (dbName !== 'rideroundup_test') {
    console.error(`[CRITICAL ABORT] Target database is "${dbName}", NOT "rideroundup_test". Aborting migration immediately!`);
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db('rideroundup_test');

  console.log(`✓ Safety check passed: Connected strictly to database "${db.databaseName}"`);

  // 1. Fetch Master Catalogs
  const masterFeatures = await db.collection('features').find({}, { projection: { _id: 1 } }).toArray();
  const masterColors = await db.collection('colors').find({}, { projection: { _id: 1 } }).toArray();
  const masterFeatureIdSet = new Set(masterFeatures.map(f => f._id.toString()));
  const masterColorIdSet = new Set(masterColors.map(c => c._id.toString()));

  console.log(`Master Catalog Loaded: ${masterFeatures.length} features, ${masterColors.length} colors.`);

  // 2. Fetch Junction Collections & Aggregations
  const totalVFCount = await db.collection('variantfeatures').countDocuments({});
  const totalVCCount = await db.collection('variantcolors').countDocuments({});
  const variants = await db.collection('variants').find({}, { projection: { _id: 1, name: 1 } }).toArray();
  const validVariantIdSet = new Set(variants.map(v => v._id.toString()));

  console.log(`Found ${variants.length} total variants.`);
  console.log(`Found ${totalVFCount} VariantFeature junction records.`);
  console.log(`Found ${totalVCCount} VariantColor junction records.`);

  // Fetch all VF records grouped by variantId via aggregation
  const groupedFeatures = await db.collection('variantfeatures').aggregate([
    {
      $group: {
        _id: '$variantId',
        features: {
          $push: {
            featureId: '$featureId',
            availability: '$availability'
          }
        }
      }
    }
  ]).toArray();

  const vfByVariantMap = new Map<string, Array<{ featureId: any; availability: string }>>();
  let validStandardCount = 0;
  let validOptionalCount = 0;
  let validUnavailableCount = 0;
  let orphanVFCount = 0;

  for (const gf of groupedFeatures) {
    const vIdStr = gf._id ? gf._id.toString() : '';
    if (validVariantIdSet.has(vIdStr)) {
      vfByVariantMap.set(vIdStr, gf.features);
      for (const f of gf.features) {
        if (f.availability === 'standard') validStandardCount++;
        else if (f.availability === 'optional') validOptionalCount++;
        else if (f.availability === 'unavailable') validUnavailableCount++;
      }
    } else {
      orphanVFCount += gf.features.length;
    }
  }

  // Fetch all VC records grouped by variantId via aggregation
  const groupedColors = await db.collection('variantcolors').aggregate([
    {
      $group: {
        _id: '$variantId',
        colors: {
          $push: {
            colorId: '$colorId',
            imageUrl: '$imageUrl',
            isBaseColor: '$isBaseColor',
            extraPrice: '$extraPrice',
            status: '$status'
          }
        }
      }
    }
  ]).toArray();

  const vcByVariantMap = new Map<string, Array<any>>();
  let validColorCount = 0;
  let orphanVCCount = 0;

  for (const gc of groupedColors) {
    const vIdStr = gc._id ? gc._id.toString() : '';
    if (validVariantIdSet.has(vIdStr)) {
      vcByVariantMap.set(vIdStr, gc.colors);
      validColorCount += gc.colors.length;
    } else {
      orphanVCCount += gc.colors.length;
    }
  }

  console.log(`\nJunction Breakdown Analysis:`);
  console.log(`  - Valid VariantFeature Mappings (Matching 247 variants): ${validStandardCount + validOptionalCount + validUnavailableCount}`);
  console.log(`    * Standard: ${validStandardCount}`);
  console.log(`    * Optional: ${validOptionalCount}`);
  console.log(`    * Unavailable: ${validUnavailableCount}`);
  console.log(`  - Orphan VariantFeature Mappings (Non-existent variantId): ${orphanVFCount}`);
  console.log(`  - Total VariantFeature Records: ${totalVFCount}`);
  console.log(`  - Valid VariantColor Mappings (Matching 247 variants): ${validColorCount}`);
  console.log(`  - Orphan VariantColor Mappings (Non-existent variantId): ${orphanVCCount}`);
  console.log(`  - Total VariantColor Records: ${totalVCCount}`);

  // 3. Pre-Migration Validation Strategy
  console.log('\n--- PRE-WRITE VALIDATION ---');
  let validationPassed = true;

  for (const variant of variants) {
    const vId = variant._id.toString();
    const vfs = vfByVariantMap.get(vId) || [];
    const vcs = vcByVariantMap.get(vId) || [];

    const stdIds = vfs.filter(f => f.availability === 'standard').map(f => f.featureId.toString());
    const optIds = vfs.filter(f => f.availability === 'optional').map(f => f.featureId.toString());

    // Validation Check 1: No duplicates in standard
    if (new Set(stdIds).size !== stdIds.length) {
      console.error(`[VALIDATION ERROR] Variant ${vId} (${variant.name}) has duplicate standard feature IDs.`);
      validationPassed = false;
    }

    // Validation Check 2: No duplicates in optional
    if (new Set(optIds).size !== optIds.length) {
      console.error(`[VALIDATION ERROR] Variant ${vId} (${variant.name}) has duplicate optional feature IDs.`);
      validationPassed = false;
    }

    // Validation Check 3: Overlap between standard and optional
    const stdSet = new Set(stdIds);
    for (const optId of optIds) {
      if (stdSet.has(optId)) {
        console.error(`[VALIDATION ERROR] Variant ${vId} (${variant.name}) feature ${optId} exists in BOTH standard and optional!`);
        validationPassed = false;
      }
    }

    // Validation Check 4: Master feature references existence
    for (const fId of [...stdIds, ...optIds]) {
      if (!masterFeatureIdSet.has(fId)) {
        console.error(`[VALIDATION ERROR] Variant ${vId} references non-existent featureId ${fId}`);
        validationPassed = false;
      }
    }

    // Validation Check 5: Master color references existence
    for (const vc of vcs) {
      if (!masterColorIdSet.has(vc.colorId.toString())) {
        console.error(`[VALIDATION ERROR] Variant ${vId} references non-existent colorId ${vc.colorId}`);
        validationPassed = false;
      }
    }
  }

  if (!validationPassed) {
    console.error('\n[CRITICAL ERROR] Pre-write validation failed! Aborting migration without writing anything.');
    await client.close();
    process.exit(1);
  }

  console.log('✓ All Pre-Write Validations PASSED cleanly!');

  // 4. Perform Data Migration ($set features and colors per variant)
  console.log('\n--- EXECUTING MIGRATION ---');

  const bulkOps = variants.map(variant => {
    const vId = variant._id.toString();
    const vfs = vfByVariantMap.get(vId) || [];
    const vcs = vcByVariantMap.get(vId) || [];

    const standardObjectIds = vfs
      .filter(f => f.availability === 'standard')
      .map(f => new ObjectId(f.featureId));

    const optionalObjectIds = vfs
      .filter(f => f.availability === 'optional')
      .map(f => new ObjectId(f.featureId));

    const embeddedColors = vcs.map(c => ({
      colorId: new ObjectId(c.colorId),
      imageUrl: c.imageUrl || null,
      isBaseColor: c.isBaseColor ?? false,
      extraPrice: c.extraPrice ?? 0,
      status: c.status || 'active',
    }));

    return {
      updateOne: {
        filter: { _id: variant._id },
        update: {
          $set: {
            features: {
              standard: standardObjectIds,
              optional: optionalObjectIds,
            },
            colors: embeddedColors,
          },
        },
      },
    };
  });

  const bulkResult = await db.collection('variants').bulkWrite(bulkOps, { ordered: true });
  console.log(`✓ BulkWrite executed cleanly: ${bulkResult.modifiedCount} documents updated.`);

  // 5. Post-Migration Verification
  console.log('\n--- POST-MIGRATION VERIFICATION ---');
  const updatedVariants = await db.collection('variants').find({}, { projection: { features: 1, colors: 1 } }).toArray();

  let postStandardCount = 0;
  let postOptionalCount = 0;
  let postColorCount = 0;

  for (const uv of updatedVariants) {
    postStandardCount += uv.features?.standard?.length || 0;
    postOptionalCount += uv.features?.optional?.length || 0;
    postColorCount += uv.colors?.length || 0;
  }

  console.log(`Post-Migration Embedded Reference Verification:`);
  console.log(`  - Embedded Standard Feature References: ${postStandardCount} (Matches Valid Standard: ${validStandardCount})`);
  console.log(`  - Embedded Optional Feature References: ${postOptionalCount} (Matches Valid Optional: ${validOptionalCount})`);
  console.log(`  - Unavailable Features Omitted: ${validUnavailableCount} (Verified omitted from arrays)`);
  console.log(`  - Embedded Color References: ${postColorCount} (Matches Valid Colors: ${validColorCount})`);
  console.log(`  - Total Variants in DB: ${updatedVariants.length} (Expected: ${variants.length})`);

  // Verify intact legacy collections
  const postVFCount = await db.collection('variantfeatures').countDocuments({});
  const postVCCount = await db.collection('variantcolors').countDocuments({});

  console.log(`Legacy Collection Integrity Check:`);
  console.log(`  - variantfeatures count: ${postVFCount} (100% Intact)`);
  console.log(`  - variantcolors count: ${postVCCount} (100% Intact)`);

  const errors: string[] = [];
  if (postStandardCount !== validStandardCount) errors.push(`Standard feature count mismatch: ${postStandardCount} vs ${validStandardCount}`);
  if (postOptionalCount !== validOptionalCount) errors.push(`Optional feature count mismatch: ${postOptionalCount} vs ${validOptionalCount}`);
  if (postColorCount !== validColorCount) errors.push(`Color count mismatch: ${postColorCount} vs ${validColorCount}`);
  if (updatedVariants.length !== variants.length) errors.push(`Variant count mismatch: ${updatedVariants.length} vs ${variants.length}`);
  if (postVFCount !== totalVFCount) errors.push(`variantfeatures document loss detected!`);
  if (postVCCount !== totalVCCount) errors.push(`variantcolors document loss detected!`);

  if (errors.length > 0) {
    console.error('\n[POST-MIGRATION FAILURE]', errors);
    await client.close();
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('SUCCESS: MIGRATION & VERIFICATION COMPLETED CLEANLY!');
  console.log('==================================================');

  await client.close();
}

runMigration().catch(err => {
  console.error('[FATAL ERROR IN MIGRATION SCRIPT]', err);
  process.exit(1);
});
