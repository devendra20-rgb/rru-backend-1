require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@admin.com' },
    {
      $set: {
        username: 'admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
  console.log('Admin user ready: admin@admin.com / Admin@123');
  await mongoose.disconnect();
}

seedAdmin().catch(console.error);
