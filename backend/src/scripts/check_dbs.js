const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGODB_URI;
  
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const adminDb = conn.db.admin();
    const listDatabases = await adminDb.listDatabases();
    
    console.log("Databases on cluster:");
    for (const db of listDatabases.databases) {
      console.log(`- ${db.name}`);
      const dbConn = await mongoose.createConnection(uri.replace(/\/[^/?]+(\?.*)?$/, `/${db.name}$1`)).asPromise();
      const brands = await dbConn.collection('brands').find().toArray();
      if (brands.length > 0) {
        console.log(`  Brands (${brands.length}): ${brands.map(b => b.brandCode).join(', ')}`);
      }
      await dbConn.close();
    }
    
    await conn.close();
  } catch (error) {
    console.error(error);
  }
}

run();
