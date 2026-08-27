const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function run() {
  const uri = "mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/?retryWrites=true&w=majority";
  
  try {
    const conn = await mongoose.createConnection(uri).asPromise();
    const adminDb = conn.db.admin();
    const listDatabases = await adminDb.listDatabases();
    
    console.log("Databases on cluster:");
    for (const db of listDatabases.databases) {
      console.log(`- ${db.name}`);
      const dbConn = await mongoose.createConnection(`mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/${db.name}?retryWrites=true&w=majority`).asPromise();
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
