import { MongoClient } from 'mongodb';

declare global {
	let _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(process.env.MONGODB_URI as string);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
	if (!_mongoClientPromise) {
		_mongoClientPromise = client.connect();
	}
	clientPromise = _mongoClientPromise;
} else {
	clientPromise = client.connect();
}

export default clientPromise;
