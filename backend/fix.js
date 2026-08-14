const fs = require('fs');
let data = fs.readFileSync('src/modules/catalog/features/feature.service.ts', 'utf8');
data = data.replace(/new AppError\((\d+),\s*'(.*?)'\)/g, (match, p1, p2) => `new AppError('${p2}', ${p1})`);
fs.writeFileSync('src/modules/catalog/features/feature.service.ts', data);
