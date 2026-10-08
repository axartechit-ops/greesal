const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  console.log('🚀 Initializing MongoDB Server on port 27017...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'greesal_db',
    },
  });

  const uri = mongod.getUri();
  console.log(`✅ MongoDB Server is RUNNING at: ${uri}`);
  console.log(`📡 Listening on: mongodb://localhost:27017`);
  console.log('Press Ctrl+C to stop.');

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping MongoDB Server...');
    await mongod.stop();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start MongoDB Server:', err);
  process.exit(1);
});
