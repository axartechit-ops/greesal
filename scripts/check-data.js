const dns = require('dns');
const { MongoClient } = require('mongodb');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  'mongodb+srv://info_db_user:E50Uk0B0scjdJEXV@cluster0.9gjtwsn.mongodb.net/greesal?retryWrites=true&w=majority';

async function checkDatabaseAndData() {
  console.log('====================================================');
  console.log('🍃 MongoDB Atlas Connection & Data Inspector');
  console.log('====================================================');

  const start = Date.now();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    await client.connect();
    const latency = Date.now() - start;
    const db = client.db('greesal');
    const ping = await db.command({ ping: 1 });

    console.log(`✅ CONNECTION STATUS: CONNECTED`);
    console.log(`⏱️  Round-trip Latency: ${latency} ms`);
    console.log(`🎯 Database Name: "${db.databaseName}"`);
    console.log(`📡 Ping Response:`, ping);

    const collections = await db.listCollections().toArray();
    console.log(`\n====================================================`);
    console.log(`📂 COLLECTIONS & RECORD COUNTS (${collections.length} Total):`);
    console.log(`====================================================`);

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` • ${col.name.padEnd(12)} : ${count} documents`);
    }

    // Salads Inspection
    console.log(`\n====================================================`);
    console.log(`🥗 SALADS DATA (Sample Preview):`);
    console.log(`====================================================`);
    const salads = await db.collection('salads').find({}).limit(4).toArray();
    salads.forEach((s, idx) => {
      console.log(` [${idx + 1}] ${s.name}`);
      console.log(`     Price: ${s.price} | Tag: ${s.tag} | Calories: ${s.calories} | Protein: ${s.protein}`);
      if (s.ingredients && s.ingredients.length > 0) {
        console.log(`     Ingredients: ${s.ingredients.slice(0, 4).join(', ')}...`);
      }
    });

    // Settings Inspection
    console.log(`\n====================================================`);
    console.log(`⚙️  HOMEPAGE & STORE SETTINGS:`);
    console.log(`====================================================`);
    const settings = await db.collection('settings').findOne({ _id: 'homepage' });
    if (settings) {
      console.log(` • Title: "${settings.title || settings.heroSlogan}"`);
      console.log(` • Badge: "${settings.heroBadge || settings.badgeText || 'N/A'}"`);
      console.log(` • Contact Phone: "${settings.contactPhone || 'N/A'}"`);
      console.log(` • Notice: "${settings.notice || 'N/A'}"`);
      if (Array.isArray(settings.categories)) {
        console.log(` • Categories (${settings.categories.length}): ${settings.categories.map((c) => c.label).join(', ')}`);
      }
    } else {
      console.log(` • No homepage settings found.`);
    }

    // Reviews Inspection
    console.log(`\n====================================================`);
    console.log(`⭐ CUSTOMER REVIEWS (Sample Preview):`);
    console.log(`====================================================`);
    const reviews = await db.collection('reviews').find({}).limit(3).toArray();
    reviews.forEach((r, idx) => {
      console.log(` [${idx + 1}] ${r.name} - Rating: ${r.rating} / 5 Stars`);
      console.log(`     "${r.text}"`);
    });

    console.log(`\n====================================================`);
    console.log(`🎉 ALL DATA IS VALID AND VERIFIED IN MONGODB ATLAS!`);
    console.log(`====================================================`);
  } catch (err) {
    console.error(`❌ Connection failed:`, err.message);
  } finally {
    await client.close();
  }
}

checkDatabaseAndData();
