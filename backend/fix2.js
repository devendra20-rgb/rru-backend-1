const fs = require('fs');
let data = fs.readFileSync('src/modules/catalog/features/feature.repository.ts', 'utf8');
data = data.replace(/import { FilterQuery, Types } from 'mongoose';/g, "import { Types } from 'mongoose';");
data = data.replace(/FilterQuery<[^>]+>/g, 'Record<string, any>');
fs.writeFileSync('src/modules/catalog/features/feature.repository.ts', data);
