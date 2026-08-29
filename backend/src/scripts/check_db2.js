const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

async function run() {
  const uriBase = process.env.MONGODB_URI;
  const uriOptions = "?retryWrites=true&w=majority";
  
  try {
    const conn1 = await mongoose.createConnection(`${uriBase}rideroundup${uriOptions}`).asPromise();
    const brands1 = await conn1.collection('brands').find().toArray();
    console.log(`rideroundup DB brands (${brands1.length}): ${brands1.map(b => b.brandCode).join(', ')}`);
    await conn1.close();

    const conn2 = await mongoose.createConnection(`${uriBase}test${uriOptions}`).asPromise();
    const brands2 = await conn2.collection('brands').find().toArray();
    console.log(`test DB brands (${brands2.length}): ${brands2.map(b => b.brandCode).join(', ')}`);
    await conn2.close();

  } catch (error) {
    console.error(error);
  }
}

run();
