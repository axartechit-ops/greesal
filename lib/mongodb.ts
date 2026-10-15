import { MongoClient, MongoClientOptions } from 'mongodb';
import dns from 'dns';

// Fix slow DNS lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in restricted environments
}

const PRIMARY_URI =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  'mongodb+srv://info_db_user:E50Uk0B0scjdJEXV@cluster0.9gjtwsn.mongodb.net/greesal?retryWrites=true&w=majority';

// Direct replica-set fallback (immune to Windows SRV querySrv ECONNREFUSED)
const DIRECT_REPLICA_URI =
  'mongodb://info_db_user:E50Uk0B0scjdJEXV@ac-ya1hbvj-shard-00-00.9gjtwsn.mongodb.net:27017,ac-ya1hbvj-shard-00-01.9gjtwsn.mongodb.net:27017,ac-ya1hbvj-shard-00-02.9gjtwsn.mongodb.net:27017/greesal?ssl=true&replicaSet=atlas-dl2je4-shard-0&authSource=admin&retryWrites=true&w=majority';

const options: MongoClientOptions = {
  maxPoolSize: 20,
  minPoolSize: 2,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 15000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function createClientConnection(): Promise<MongoClient> {
  try {
    const client = new MongoClient(PRIMARY_URI, options);
    return await client.connect();
  } catch (err: any) {
    if (err?.message?.includes('querySrv') || err?.message?.includes('ECONNREFUSED')) {
      console.warn('⚠️ SRV DNS lookup failed on Windows. Connecting directly to Atlas replica set nodes...');
      const fallbackClient = new MongoClient(DIRECT_REPLICA_URI, options);
      return await fallbackClient.connect();
    }
    throw err;
  }
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientConnection().catch((err) => {
      console.warn('MongoDB connection error:', err?.message || err);
      delete global._mongoClientPromise;
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = createClientConnection();
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

export default clientPromise;
