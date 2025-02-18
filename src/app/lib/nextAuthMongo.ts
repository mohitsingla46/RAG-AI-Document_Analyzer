import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';
import { Adapter } from 'next-auth/adapters';

export const getMongoDBAdapter = async (): Promise<Adapter> => {
    const client = await clientPromise;
    return MongoDBAdapter(client);
};
