const fs = require('fs');

let controller = fs.readFileSync('src/modules/catalog/features/feature.controller.ts', 'utf8');
controller = controller.replace(/getFeatures\(req.query\)/, 'getFeatures(req.query as unknown as any)');
controller = controller.replace(/getVariantFeatures\(req.query\)/, 'getVariantFeatures(req.query as unknown as any)');
controller = controller.replace(/getFeatureById\(req.params.id\)/, 'getFeatureById(req.params.id as string)');
controller = controller.replace(/getFeatureBySlug\(req.params.slug\)/, 'getFeatureBySlug(req.params.slug as string)');
controller = controller.replace(/updateFeature\(req.params.id, req.body\)/, 'updateFeature(req.params.id as string, req.body)');
controller = controller.replace(/deleteFeature\(req.params.id\)/, 'deleteFeature(req.params.id as string)');
controller = controller.replace(/getVariantFeatureById\(req.params.id\)/, 'getVariantFeatureById(req.params.id as string)');
controller = controller.replace(/getFeaturesByVariantId\(req.params.variantId\)/, 'getFeaturesByVariantId(req.params.variantId as string)');
controller = controller.replace(/updateVariantFeature\(req.params.id, req.body\)/, 'updateVariantFeature(req.params.id as string, req.body)');
controller = controller.replace(/deleteVariantFeature\(req.params.id\)/, 'deleteVariantFeature(req.params.id as string)');
fs.writeFileSync('src/modules/catalog/features/feature.controller.ts', controller);

let service = fs.readFileSync('src/modules/catalog/features/feature.service.ts', 'utf8');
service = service.replace(/existingSlug\.id !== id/, 'existingSlug._id.toString() !== id');
fs.writeFileSync('src/modules/catalog/features/feature.service.ts', service);
