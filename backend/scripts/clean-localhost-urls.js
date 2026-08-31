const mongoose = require('mongoose');

async function fixRelativeUrls() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const mediaList = await mongoose.connection.db.collection('media').find({}).toArray();
  console.log(`Checking ${mediaList.length} total media records...`);

  let count = 0;
  for (const m of mediaList) {
    if (m.url && m.url.includes('http://localhost:5000')) {
      const cleanUrl = m.url.replace(/^http:\/\/localhost:5000/, '');
      await mongoose.connection.db.collection('media').updateOne({ _id: m._id }, { $set: { url: cleanUrl } });
      console.log(`Updated media ${m._id}: ${m.url} -> ${cleanUrl}`);
      count++;
    }
  }

  console.log(`Successfully converted ${count} media records from localhost to relative URLs.`);
  process.exit(0);
}

fixRelativeUrls().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
