const bcrypt = require('bcryptjs');
const hash = '$2b$10$hAPnrEqFwoXEFaPBCKUDfOBk/1l5dm5SUNeOuXkyO82jV2YCWVThy';
const candidates = [
  'admin',
  'admin123',
  'Admin123',
  'Admin123!',
  'admin@123',
  'Admin@123',
  'adminpassword',
  'adminuser',
  'admin1234',
  'admin12345',
  '123456',
  '12345678',
  '1234567890',
  'password',
  'password123',
  'Password123',
  'Password123!',
  'password@123',
  'Password@123',
  'rru',
  'rru123',
  'rruadmin',
  'rruadmin123',
  'rideroundup',
  'rideroundup123',
  'editorial',
  'editorial123',
  'editor',
  'editor123',
  'admin@example.com',
  'admin2025',
  'admin2026',
  'rru2025',
  'rru2026',
  'rrueditor',
  'rrueditorial123',
  'admin_rru',
  'rru_admin'
];

for (const c of candidates) {
  if (bcrypt.compareSync(c, hash)) {
    console.log('SUCCESS: password is: ' + c);
    process.exit(0);
  }
}
console.log('FAILED');
