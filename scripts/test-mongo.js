const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// 1. Configure DNS to reliably resolve SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if restricted
}

// 2. Helper to load environment variables from .env.local or .env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env'),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  'mongodb+srv://info_db_user:E50Uk0B0scjdJEXV@cluster0.9gjtwsn.mongodb.net/greesal?retryWrites=true&w=majority';

console.log('====================================================');
console.log('🍃 MongoDB Atlas Connection Diagnostic Tool');
console.log('====================================================');

// Mask password for display
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`📌 Using URI: ${maskedUri}\n`);

if (uri.includes('<db_username>')) {
  console.error('❌ ERROR: The URI still contains the placeholder "<db_username>"!');
  console.error('👉 Step to fix:');
  console.error('   1. Open .env and .env.local in your editor');
  console.error('   2. Replace "<db_username>" with your MongoDB Atlas database username');
  console.error('      Example: mongodb+srv://greesal:E50Uk0B0scjdJEXV@cluster0.9gjtwsn.mongodb.net/greesal?retryWrites=true&w=majority');
  process.exit(1);
}

async function testConnection() {
  console.log('⏳ Connecting to MongoDB Atlas cluster...');
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    await client.connect();
    const pingResult = await client.db().command({ ping: 1 });
    const dbName = client.db().databaseName;
    console.log(`\n✅ SUCCESS: Successfully connected to MongoDB Atlas!`);
    console.log(`🎯 Active Database: "${dbName}"`);
    console.log(`📡 Ping Response:`, pingResult);

    const collections = await client.db().listCollections().toArray();
    console.log(`📂 Collections count: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   Collections:', collections.map((c) => c.name).join(', '));
    }
    console.log('\n🚀 Your application is ready to use MongoDB Atlas!');
  } catch (err) {
    console.error('\n❌ Connection Failed!');
    console.error(`Error Message: ${err.message}\n`);

    if (err.message.includes('alert internal error') || err.message.includes('SSL alert number 80')) {
      console.error('🔒 REASON: IP Address Not Whitelisted in MongoDB Atlas Network Access');
      console.error('👉 How to fix (Atlas Dashboard):');
      console.error('   1. Go to https://cloud.mongodb.com/');
      console.error('   2. In the left menu under "Security", click "Network Access"');
      console.error('   3. Click "+ Add IP Address"');
      console.error('   4. Choose "Allow Access From Anywhere" (0.0.0.0/0) or "Add Current IP Address"');
      console.error('   5. Click "Confirm" and wait 1 minute for it to become Active.');
    } else if (err.message.includes('Authentication failed') || err.message.includes('auth failed')) {
      console.error('🔑 REASON: Authentication Failed (Invalid Username or Password)');
      console.error('👉 How to fix (Atlas Dashboard):');
      console.error('   1. In MongoDB Atlas, go to "Database Access" under "Security"');
      console.error('   2. Verify your database username and reset password if needed.');
      console.error('   3. Update .env and .env.local with the matching username & password.');
    } else if (err.message.includes('querySrv') || err.message.includes('ENOTFOUND')) {
      console.error('🌐 REASON: DNS resolution failure for Atlas cluster');
      console.error('👉 Check your internet connection or DNS resolver.');
    } else {
      console.error('👉 Check MongoDB Atlas cluster status and connection string format.');
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

testConnection();
