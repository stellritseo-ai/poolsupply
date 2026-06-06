import { MongoClient, Db } from 'mongodb';

// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGODB_URI || "mongodb+srv://Pools_database_db_user:pPH0aCfvACpdl0vR@pools.4nsntwy.mongodb.net/?appName=Pools";

const client = new MongoClient(uri);

let dbConnection: Db | null = null;

/**
 * Connects to the MongoDB database and returns the Db instance.
 * Reuses the existing connection if it's already established.
 */
export async function connectDB(): Promise<Db> {
  if (dbConnection) {
    return dbConnection;
  }
  
  try {
    await client.connect();
    // Defaulting database name to 'aquapro' which fits the application context
    dbConnection = client.db('aquapro');
    console.log("Successfully connected to MongoDB at localhost:27017");
    return dbConnection;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): MongoClient {
  return client;
}
