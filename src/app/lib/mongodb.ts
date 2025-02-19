import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> };

if (process.env.NODE_ENV === "development") {
	if (!globalForMongo._mongoClientPromise) {
		client = new MongoClient(uri, options);
		globalForMongo._mongoClientPromise = client.connect();
	}
	clientPromise = globalForMongo._mongoClientPromise;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

export default clientPromise;
