import { MongoClient, MongoClientOptions } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/greesal';
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
};

let client: MongoClient | null = null;
let clientPromiseInstance: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client && clientPromiseInstance) {
    try {
      const c = await clientPromiseInstance;
      return c;
    } catch {
      clientPromiseInstance = null;
      client = null;
    }
  }

  client = new MongoClient(uri, options);
  clientPromiseInstance = client.connect().catch((err) => {
    console.warn('MongoDB connection error (will retry on next request):', err?.message || err);
    clientPromiseInstance = null;
    client = null;
    throw err;
  });
  return clientPromiseInstance;
}

// Thenable export compatible with NextAuth and direct `await clientPromise`
const clientPromise = {
  then<TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return getMongoClient().then(onfulfilled, onrejected);
  },
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<MongoClient | TResult> {
    return getMongoClient().catch(onrejected);
  },
  finally(onfinally?: (() => void) | null): Promise<MongoClient> {
    return getMongoClient().finally(onfinally);
  },
} as unknown as Promise<MongoClient>;

export default clientPromise;
