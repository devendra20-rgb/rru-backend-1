/**
 * Backfill variants.modelId from generations.modelId when missing.
 * Seeded catalog rows often had generationId only, which broke brand filtering.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required');

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const variants = db.collection('variants');
  const generations = db.collection('generations');

  const broken = await variants
    .find({
      $or: [{ modelId: { $exists: false } }, { modelId: null }],
      generationId: { $exists: true, $ne: null },
    })
    .toArray();

  console.log(`Found ${broken.length} variants missing modelId`);

  let updated = 0;
  let skipped = 0;

  for (const v of broken) {
    const gen = await generations.findOne({ _id: v.generationId });
    if (!gen?.modelId) {
      skipped++;
      console.warn(`Skip ${v.slug}: generation has no modelId`);
      continue;
    }

    await variants.updateOne({ _id: v._id }, { $set: { modelId: gen.modelId } });
    updated++;
    console.log(`Fixed ${v.slug} → modelId ${gen.modelId}`);
  }

  console.log(JSON.stringify({ updated, skipped, totalBroken: broken.length }, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
