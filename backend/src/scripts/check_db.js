const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function run() {
  const uriBase = "mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/";
  const uriOptions = "?retryWrites=true&w=majority";
  
  try {
    const conn1 = await mongoose.createConnection(`${uriBase}rideroundup${uriOptions}`).asPromise();
    const count1 = await conn1.collection('brands').countDocuments();
    const count1Active = await conn1.collection('brands').countDocuments({ status: 'active' });
    console.log(`rideroundup DB - brands total: ${count1}, active: ${count1Active}`);
    await conn1.close();

    const conn2 = await mongoose.createConnection(`${uriBase}test${uriOptions}`).asPromise();
    const count2 = await conn2.collection('brands').countDocuments();
    const count2Active = await conn2.collection('brands').countDocuments({ status: 'active' });
    console.log(`test DB - brands total: ${count2}, active: ${count2Active}`);
    await conn2.close();

  } catch (error) {
    console.error(error);
  }
}

run();
