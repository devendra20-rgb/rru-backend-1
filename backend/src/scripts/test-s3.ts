import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { S3StorageProvider } from '../modules/media/storage/s3.storage';

async function testS3() {
  console.log('🚀 Starting S3 Diagnostic Test...');
  console.log('Config:');
  console.log(`- AWS_REGION: ${process.env.AWS_REGION}`);
  console.log(`- AWS_S3_BUCKET: ${process.env.AWS_S3_BUCKET}`);
  console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '***' + process.env.AWS_ACCESS_KEY_ID.substring(process.env.AWS_ACCESS_KEY_ID.length - 4) : 'undefined'}`);

  try {
    const provider = new S3StorageProvider();
    console.log('✅ S3 Client initialized successfully.');

    const testContent = Buffer.from('RideRoundUp AWS S3 Connection Test File - ' + new Date().toISOString());
    const fileData = {
      buffer: testContent,
      originalname: 's3-test-file.txt',
      mimetype: 'text/plain',
      size: testContent.length,
    };

    console.log('📤 Uploading test file...');
    const storageKey = await provider.upload(fileData, 'test-diagnostics');
    console.log(`✅ Upload successful. Storage Key: ${storageKey}`);

    const url = provider.getUrl(storageKey);
    console.log(`🔗 Generated File URL: ${url}`);

    console.log('🗑️ Deleting test file...');
    await provider.delete(storageKey);
    console.log('✅ Deletion successful.');
    
    console.log('\n🎉 AWS S3 integration is working perfectly! We are fully ready to deploy.');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ S3 Diagnostic Test Failed!');
    console.error(err);
    process.exit(1);
  }
}

testS3();
