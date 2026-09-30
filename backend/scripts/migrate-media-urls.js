const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ [SAFETY ABORT] MONGODB_URI environment variable is missing! Aborting.');
    process.exit(1);
  }

  if (uri.includes('/rideroundup?') || uri.endsWith('/rideroundup')) {
    console.error('❌ [SAFETY GUARD ABORT] MONGODB_URI points to production database "rideroundup". Operations against production are strictly prohibited!');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const mediaList = await mongoose.connection.db.collection('media').find({ url: { $regex: 'amazonaws\\.com' } }).toArray();
  console.log(`Found ${mediaList.length} media records to update.`);

  for (const m of mediaList) {
    if (m.storageKey) {
      const newUrl = `http://localhost:5000/api/v1/media/file/${m.storageKey}`;
      await mongoose.connection.db.collection('media').updateOne({ _id: m._id }, { $set: { url: newUrl } });
      console.log(`Updated media ${m._id} (${m.originalName}): -> ${newUrl}`);
    }
  }

  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
