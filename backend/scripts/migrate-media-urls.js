const mongoose = require('mongoose');

async function migrate() {
  const uri = 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority';
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
