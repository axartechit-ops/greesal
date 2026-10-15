import dns from 'dns';
import path from 'path';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { DEFAULT_SALADS } from '../lib/salads';
import { DEFAULT_SITE_SETTINGS } from '../lib/siteSettings';
import { DEFAULT_REVIEWS } from '../lib/reviews';

// Ensure DNS works on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

// Load environment variables
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

async function seedAtlas() {
  console.log('====================================================');
  console.log('🌱 Seeding MongoDB Atlas Cloud Database...');
  console.log('====================================================');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
  });

  try {
    await client.connect();
    const db = client.db('greesal');
    console.log(`✅ Connected to database: "${db.databaseName}"\n`);

    // 1. Seed Salads
    const saladsCount = await db.collection('salads').countDocuments();
    if (saladsCount === 0) {
      console.log(`🥗 Seeding ${DEFAULT_SALADS.length} salads into 'salads' collection...`);
      const saladDocs = DEFAULT_SALADS.map((s) => {
        const { _id, ...rest } = s as any;
        return {
          ...rest,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
      await db.collection('salads').insertMany(saladDocs);
      console.log(`   ✅ Successfully seeded ${DEFAULT_SALADS.length} salads!`);
    } else {
      console.log(`🥗 'salads' collection already contains ${saladsCount} items.`);
    }

    // 2. Seed Homepage & Site Settings
    const existingSettings = await db.collection('settings').findOne({ _id: 'homepage' as any });
    if (!existingSettings) {
      console.log(`⚙️  Seeding initial site settings into 'settings' collection...`);
      const { _id, ...initialSettings } = DEFAULT_SITE_SETTINGS as any;
      await db.collection('settings').updateOne(
        { _id: 'homepage' as any },
        {
          $setOnInsert: {
            ...initialSettings,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`   ✅ Successfully seeded homepage settings!`);
    } else {
      console.log(`⚙️  'settings' collection already initialized.`);
    }

    // 3. Seed Reviews
    const reviewsCount = await db.collection('reviews').countDocuments();
    if (reviewsCount === 0) {
      console.log(`⭐ Seeding ${DEFAULT_REVIEWS.length} reviews into 'reviews' collection...`);
      const reviewDocs = DEFAULT_REVIEWS.map((r) => {
        const { _id, ...rest } = r as any;
        return {
          ...rest,
          createdAt: new Date().toISOString(),
        };
      });
      await db.collection('reviews').insertMany(reviewDocs);
      console.log(`   ✅ Successfully seeded ${DEFAULT_REVIEWS.length} reviews!`);
    } else {
      console.log(`⭐ 'reviews' collection already contains ${reviewsCount} reviews.`);
    }

    // 4. Summarize all collections in MongoDB Atlas
    console.log('\n====================================================');
    console.log('📊 Current MongoDB Atlas Database Status:');
    console.log('====================================================');
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` • Collection: "${col.name}" -> ${count} documents`);
    }

    console.log('\n🎉 ALL DATA IS NOW STORED IN AND FETCHED FROM MONGODB ATLAS!');
  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await client.close();
  }
}

seedAtlas();
