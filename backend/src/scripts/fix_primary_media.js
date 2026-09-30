const mongoose = require('mongoose');

async function setPrimary(variantSlug, targetPattern) {
  const v = await mongoose.connection.db.collection('variants').findOne({ slug: variantSlug });
  if (!v) {
    console.log(`Variant not found: ${variantSlug}`);
    return;
  }
  
  // Set all other media to isPrimary: false
  await mongoose.connection.db.collection('media').updateMany(
    { entityId: v._id },
    { $set: { isPrimary: false } }
  );

  // Find target media item
  const doc = await mongoose.connection.db.collection('media').findOne({
    entityId: v._id,
    originalName: { $regex: targetPattern, $options: 'i' }
  });

  if (doc) {
    await mongoose.connection.db.collection('media').updateOne(
      { _id: doc._id },
      { $set: { isPrimary: true, sortOrder: 0 } }
    );
    console.log(`✓ Updated ${v.name} (${v.slug}): set "${doc.originalName}" as Primary`);
  } else {
    console.log(`⚠ Target image pattern "${targetPattern}" not found for ${v.name} (${v.slug})`);
  }
}

async function main() {
  await mongoose.connect('mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority');
  
  console.log('--- Updating Primary Images for Audi Models ---');
  // Audi Q7 -> 3.png (front 3/4 hero)
  await setPrimary('q7-55-tfsi-quattro', '^3\\.png$');
  await setPrimary('q7-sq7', '^3\\.png$');

  // Audi Q6 -> 1.png (front 3/4 hero)
  await setPrimary('q6-e-tron-quattro', '^1\\.png$');
  await setPrimary('q6-e-tron-sq6-e-tron', '^1\\.png$');
  await setPrimary('q6-sportback-e-tron-performance', '^1\\.png$');
  await setPrimary('q6-e-tron-sq6-sportback-e-tron', '^1\\.png$');

  // Audi Q3 -> 1.png (front 3/4 hero)
  await setPrimary('q3-35-tfsi', '^1\\.png$');
  await setPrimary('q3-40-tfsi-quattro', '^1\\.png$');
  await setPrimary('q3-sportback-35-tfsi', '^1\\.png$');
  await setPrimary('q3-sportback-40-tfsi-quattro', '^1\\.png$');

  // Audi A6 -> 2.png (front 3/4 hero)
  await setPrimary('a6-sportback-e-tron-quattro', '^2\\.png$');
  await setPrimary('e-tron-s6-sportback-e-tron', '^2\\.png$');

  console.log('\n--- Updating Primary Images for Changan & Bentley (3/4 shots) ---');
  const changanVariants = [
    { slug: 'eado-plus-2nd-genra-eado-plus-1-6l-trend', target: 'front-3q' },
    { slug: 'eado-plus-2nd-genra-eado-plus-1-4t-smart', target: 'front-3q' },
    { slug: 'eado-plus-2nd-genra-eado-plus-1-4t-limited', target: 'front-3q' },
    { slug: 'eado-plus-2nd-genra-eado-plus-1-4t-sport', target: 'front-3q' },
    { slug: 'uni-k-first-gen-uni-k-limited', target: 'front-3q' },
    { slug: 'uni-t-first-genera-uni-t-limited', target: 'front-3q' },
    { slug: 'uni-t-first-genera-uni-t-sport', target: 'front-3q' },
    { slug: 'cs95-1first-gen-cs95-royal', target: 'front-3q' },
    { slug: 'cs95-1first-gen-cs95-classic', target: 'front-3q' },
    { slug: 'bentley-bentayga-bentley-bentayga-bentayga-azure', target: 'front-three-quarter' },
    { slug: 'bentley-bentayga-bentley-bentayga-bentayga-s', target: 'front-three-quarter' },
    { slug: 'bentley-bentayga-bentley-bentayga-bentayga-s-black-edition', target: 'front-three-quarter' },
  ];

  for (const item of changanVariants) {
    await setPrimary(item.slug, item.target);
  }

  console.log('\n✓ Done updating primary media.');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
