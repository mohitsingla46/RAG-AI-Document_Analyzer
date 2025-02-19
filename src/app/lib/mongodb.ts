import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
	throw new Error("MONGODB_URI is not defined in environment variables");
}

const options = {};

declare global {
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
	if (!globalThis._mongoClientPromise) {
		client = new MongoClient(uri, options);
		globalThis._mongoClientPromise = client.connect();
	}
	clientPromise = globalThis._mongoClientPromise;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

export default clientPromise;
