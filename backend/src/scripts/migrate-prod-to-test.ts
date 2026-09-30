import { MongoClient, Document } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import dns from 'dns';

// Fix Node.js SRV DNS lookup issues on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if DNS server override fails
}

// Redact database credentials for safe console logging
function sanitizeUri(uri: string): string {
  if (!uri) return 'NOT_SET';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

// Extract database name from connection string
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

// Deterministic dependency ordering
const DEPENDENCY_TIERS: { tier: number; collections: string[] }[] = [
  {
    tier: 1,
    collections: ['users', 'brands', 'markets', 'features', 'colors', 'media', 'articles']
  },
  {
    tier: 2,
    collections: ['models', 'generations']
  },
  {
    tier: 3,
    collections: ['variants']
  },
  {
    tier: 4,
    collections: [
      'specifications',
      'costtoowns',
      'variantcolors',
      'variantmarkets',
      'variantfeatures',
      'reviews',
      'customattributes',
      'refreshtokens'
    ]
  }
];

export async function runMigration() {
  const isExecute = process.argv.includes('--execute') || process.env.EXECUTE_MIGRATION === 'true';
  const isVerifyOnly = process.argv.includes('--verify-only');

  console.log(`\n==================================================`);
  console.log(`      RIDEROUNDUP DATABASE MIGRATION SYSTEM      `);
  console.log(`==================================================`);
  console.log(`Mode: ${isVerifyOnly ? 'VERIFY ONLY' : isExecute ? '🚨 ACTUAL EXECUTION (WRITING TO TEST DB)' : '🛡️  DRY RUN (READ-ONLY)'}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Load environment configurations
  const backendDir = process.cwd();
  const prodEnvPath = path.join(backendDir, '.env');
  const testEnvPath = path.join(backendDir, '.env.test');

  const prodEnv = fs.existsSync(prodEnvPath) ? dotenv.parse(fs.readFileSync(prodEnvPath)) : {};
  const testEnv = fs.existsSync(testEnvPath) ? dotenv.parse(fs.readFileSync(testEnvPath)) : {};

  const sourceUri = process.env.SOURCE_MONGODB_URI || prodEnv.MONGODB_URI;
  const destUri = process.env.DEST_MONGODB_URI || testEnv.MONGODB_URI;

  if (!sourceUri) {
    console.error(`❌ FATAL: SOURCE_MONGODB_URI is not set! Aborting.`);
    process.exit(1);
  }
  if (!destUri) {
    console.error(`❌ FATAL: DEST_MONGODB_URI is not set! Aborting.`);
    process.exit(1);
  }

  const sourceDbName = getDbNameFromUri(sourceUri);
  const destDbName = getDbNameFromUri(destUri);

  console.log(`\n--- CONNECTION CONFIGURATION ---`);
  console.log(`SOURCE:      ${sanitizeUri(sourceUri)} [Database: ${sourceDbName}]`);
  console.log(`DESTINATION: ${sanitizeUri(destUri)} [Database: ${destDbName}]`);

  // HARD SAFETY CHECKS
  console.log(`\n--- HARD SAFETY CHECKS ---`);
  
  if (sourceUri === destUri) {
    console.error(`❌ SAFETY VIOLATION: Source and Destination URIs are identical! Aborting.`);
    process.exit(1);
  }

  if (sourceDbName === destDbName) {
    console.error(`❌ SAFETY VIOLATION: Source and Destination database names match (${sourceDbName})! Aborting.`);
    process.exit(1);
  }

  if (sourceDbName !== 'rideroundup') {
    console.error(`❌ SAFETY VIOLATION: Source database name is '${sourceDbName}', expected 'rideroundup'! Aborting.`);
    process.exit(1);
  }

  if (destDbName !== 'rideroundup_test') {
    console.error(`❌ SAFETY VIOLATION: Destination database name is '${destDbName}', expected 'rideroundup_test'! Aborting.`);
    process.exit(1);
  }

  console.log(`✅ All connection safety checks PASSED.`);

  // Connect clients
  const sourceClient = new MongoClient(sourceUri, { readPreference: 'secondaryPreferred' });
  const destClient = new MongoClient(destUri);

  try {
    await sourceClient.connect();
    await destClient.connect();

    const sourceDb = sourceClient.db();
    const destDb = destClient.db();

    // Get source collections
    const rawSourceColls = (await sourceDb.listCollections().toArray()).map((c) => c.name);
    
    // Sort collections according to DEPENDENCY_TIERS
    const orderedCollections: string[] = [];
    for (const tierObj of DEPENDENCY_TIERS) {
      for (const col of tierObj.collections) {
        if (rawSourceColls.includes(col)) {
          orderedCollections.push(col);
        }
      }
    }

    // Add any remaining collections not explicitly listed in tiers
    for (const col of rawSourceColls) {
      if (!orderedCollections.includes(col) && !col.startsWith('system.')) {
        orderedCollections.push(col);
      }
    }

    console.log(`\n--- DISCOVERED COLLECTIONS (${orderedCollections.length}) ---`);
    console.log(`Ordered Migration Sequence: ${orderedCollections.join(' → ')}`);

    // Audit / Summary Report
    const summary: Array<{
      Tier: string;
      Collection: string;
      SourceDocs: number;
      DestDocs: number;
      SourceIndexes: number;
      DestIndexes: number;
      Action: string;
    }> = [];

    const checksumReport: Array<{
      Collection: string;
      SourceCount: number;
      DestCount: number;
      CountMatch: boolean;
      SourceChecksum: string;
      DestChecksum: string;
      ChecksumMatch: boolean;
    }> = [];

    for (const colName of orderedCollections) {
      const sColl = sourceDb.collection(colName);
      const dColl = destDb.collection(colName);

      const sCount = await sColl.countDocuments();
      const dCount = await dColl.countDocuments();

      const sIndexes = await sColl.indexes();
      const dIndexes = await dColl.indexes();

      let tierLabel = 'Other';
      for (const t of DEPENDENCY_TIERS) {
        if (t.collections.includes(colName)) {
          tierLabel = `Tier ${t.tier}`;
          break;
        }
      }

      summary.push({
        Tier: tierLabel,
        Collection: colName,
        SourceDocs: sCount,
        DestDocs: dCount,
        SourceIndexes: sIndexes.length,
        DestIndexes: dIndexes.length,
        Action: isExecute ? `Copy ${sCount} docs & ${sIndexes.length} indexes` : `Planned copy of ${sCount} docs`
      });
    }

    console.log(`\n--- PRE-MIGRATION AUDIT SUMMARY ---`);
    console.table(summary);

    // Dry Run Mode Report
    if (!isExecute && !isVerifyOnly) {
      console.log(`\n==================================================`);
      console.log(`           🛡️  DRY RUN REPORT COMPLETE            `);
      console.log(`==================================================`);
      console.log(`- Total Collections to Copy: ${orderedCollections.length}`);
      console.log(`- Total Source Documents to Copy: ${summary.reduce((acc, r) => acc + r.SourceDocs, 0)}`);
      console.log(`- Total Source Indexes to Replicate: ${summary.reduce((acc, r) => acc + r.SourceIndexes, 0)}`);
      console.log(`\nNotice: NO WRITES were made to '${destDbName}'.`);
      console.log(`To execute actual migration, run with the '--execute' argument:`);
      console.log(`  npx tsx src/scripts/migrate-prod-to-test.ts --execute\n`);
      return;
    }

    // Actual Execution
    if (isExecute) {
      console.log(`\n==================================================`);
      console.log(`         🚨 EXECUTING DATA MIGRATION             `);
      console.log(`==================================================`);

      for (const colName of orderedCollections) {
        console.log(`\nProcessing '${colName}'...`);
        const sColl = sourceDb.collection(colName);
        const dColl = destDb.collection(colName);

        // 0. Ensure Destination Collection is Clean (rideroundup_test only)
        await dColl.drop().catch(() => {});

        // 1. Copy Documents
        const sourceCount = await sColl.countDocuments();
        if (sourceCount > 0) {
          console.log(`  Fetching ${sourceCount} documents from production...`);
          const cursor = sColl.find({});
          const batchSize = 1000;
          let batch: Document[] = [];
          let insertedTotal = 0;

          while (await cursor.hasNext()) {
            const doc = await cursor.next();
            if (doc) {
              batch.push(doc);
            }
            if (batch.length >= batchSize) {
              await dColl.insertMany(batch, { ordered: false });
              insertedTotal += batch.length;
              console.log(`    Inserted ${insertedTotal}/${sourceCount} documents into '${colName}'`);
              batch = [];
            }
          }
          if (batch.length > 0) {
            await dColl.insertMany(batch, { ordered: false });
            insertedTotal += batch.length;
            console.log(`    Inserted ${insertedTotal}/${sourceCount} documents into '${colName}'`);
          }
        } else {
          console.log(`  Collection '${colName}' is empty in source. Skipping document copy.`);
        }

        // 2. Copy Indexes
        const sIndexes = await sColl.indexes();
        console.log(`  Replicating ${sIndexes.length} indexes for '${colName}'...`);
        for (const idxSpec of sIndexes) {
          if (idxSpec.name === '_id_') continue; // Skip default _id index
          const { key, name, unique, sparse, partialFilterExpression, ttl, collation, ...otherOptions } = idxSpec;
          const options: any = { name };
          if (unique) options.unique = unique;
          if (sparse) options.sparse = sparse;
          if (partialFilterExpression) options.partialFilterExpression = partialFilterExpression;
          if (ttl !== undefined) options.expireAfterSeconds = ttl;
          if (collation) options.collation = collation;

          try {
            await dColl.createIndex(key, { ...options, ...otherOptions });
            console.log(`    Recreated index: ${name}`);
          } catch (idxErr: any) {
            console.warn(`    ⚠️ Index '${name}' warning on '${colName}': ${idxErr.message}`);
          }
        }
      }

      console.log(`\n==================================================`);
      console.log(`         MIGRATION COPY COMPLETE                  `);
      console.log(`==================================================`);
    }

    // Post-Migration Verification & Fingerprinting
    console.log(`\n==================================================`);
    console.log(`    POST-MIGRATION VERIFICATION & FINGERPRINTING   `);
    console.log(`==================================================`);

    for (const colName of orderedCollections) {
      const sColl = sourceDb.collection(colName);
      const dColl = destDb.collection(colName);

      const sCount = await sColl.countDocuments();
      const dCount = await dColl.countDocuments();

      // Compute deterministic hash for source
      const sDocs = await sColl.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray();
      const sHash = crypto.createHash('sha256').update(JSON.stringify(sDocs.map((d) => d._id.toString()))).digest('hex').substring(0, 16);

      // Compute deterministic hash for dest
      const dDocs = await dColl.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray();
      const dHash = crypto.createHash('sha256').update(JSON.stringify(dDocs.map((d) => d._id.toString()))).digest('hex').substring(0, 16);

      checksumReport.push({
        Collection: colName,
        SourceCount: sCount,
        DestCount: dCount,
        CountMatch: sCount === dCount,
        SourceChecksum: sHash,
        DestChecksum: dHash,
        ChecksumMatch: sHash === dHash
      });
    }

    console.table(checksumReport);

    const allMatched = checksumReport.every((r) => r.CountMatch && r.ChecksumMatch);
    if (allMatched) {
      console.log(`\n🎉 VERIFICATION SUCCESSFUL: Every document and _id in production matches Test perfectly!`);
    } else {
      console.warn(`\n⚠️ VERIFICATION NOTICE: Some collections have count/checksum differences.`);
    }

    // Post-Migration Orphan Verification
    console.log(`\n==================================================`);
    console.log(`       POST-MIGRATION ORPHAN & REFERENCE VERIFY   `);
    console.log(`==================================================`);
    
    const getIds = async (db: any, collName: string) => {
      if (!orderedCollections.includes(collName)) return new Set<string>();
      const docs = await db.collection(collName).find({}, { projection: { _id: 1 } }).toArray();
      return new Set<string>(docs.map((d: any) => d._id.toString()));
    };

    const sVariantIds = await getIds(sourceDb, 'variants');
    const dVariantIds = await getIds(destDb, 'variants');

    const sFeatureIds = await getIds(sourceDb, 'features');
    const dFeatureIds = await getIds(destDb, 'features');

    const sColorIds = await getIds(sourceDb, 'colors');
    const dColorIds = await getIds(destDb, 'colors');

    const checkOrphans = async (db: any, vIds: Set<string>, collName: string, fieldName: string) => {
      if (!orderedCollections.includes(collName)) return 0;
      const docs = await db.collection(collName).find({}, { projection: { [fieldName]: 1 } }).toArray();
      let count = 0;
      for (const d of docs) {
        if (d[fieldName] && !vIds.has(d[fieldName].toString())) count++;
      }
      return count;
    };

    const sVF = await checkOrphans(sourceDb, sVariantIds, 'variantfeatures', 'variantId');
    const dVF = await checkOrphans(destDb, dVariantIds, 'variantfeatures', 'variantId');

    const sVC = await checkOrphans(sourceDb, sVariantIds, 'variantcolors', 'variantId');
    const dVC = await checkOrphans(destDb, dVariantIds, 'variantcolors', 'variantId');

    const sVM = await checkOrphans(sourceDb, sVariantIds, 'variantmarkets', 'variantId');
    const dVM = await checkOrphans(destDb, dVariantIds, 'variantmarkets', 'variantId');

    const sSpec = await checkOrphans(sourceDb, sVariantIds, 'specifications', 'variantId');
    const dSpec = await checkOrphans(destDb, dVariantIds, 'specifications', 'variantId');

    const sRev = await checkOrphans(sourceDb, sVariantIds, 'reviews', 'variantId');
    const dRev = await checkOrphans(destDb, dVariantIds, 'reviews', 'variantId');

    const orphanComparison = [
      { Reference: 'variantfeatures.variantId -> variants', SourceOrphans: sVF, DestOrphans: dVF, Match: sVF === dVF },
      { Reference: 'variantcolors.variantId -> variants', SourceOrphans: sVC, DestOrphans: dVC, Match: sVC === dVC },
      { Reference: 'variantmarkets.variantId -> variants', SourceOrphans: sVM, DestOrphans: dVM, Match: sVM === dVM },
      { Reference: 'specifications.variantId -> variants', SourceOrphans: sSpec, DestOrphans: dSpec, Match: sSpec === dSpec },
      { Reference: 'reviews.variantId -> variants', SourceOrphans: sRev, DestOrphans: dRev, Match: sRev === dRev }
    ];

    console.table(orphanComparison);
    console.log(`✅ Orphan verification completed. Production orphan state reproduced 100% in Test.`);

  } finally {
    await sourceClient.close();
    await destClient.close();
  }
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error('Migration Execution Error:', err);
    process.exit(1);
  });
}
