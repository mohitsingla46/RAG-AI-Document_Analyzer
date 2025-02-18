import { MongoClient } from 'mongodb';

// Type definition for global object to include _mongoClientPromise
declare global {
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(process.env.MONGODB_URI as string);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
	// In development, use the global _mongoClientPromise to avoid multiple connections
	if (!global._mongoClientPromise) {
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	// In production, always create a new connection
	clientPromise = client.connect();
}

export default clientPromise;
