import type { Db } from 'mongodb';

// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGODB_URI;

let client: any = null;
let dbConnection: Db | null = null;

/**
 * Connects to the MongoDB database and returns the Db instance.
 * Reuses the existing connection if it's already established.
 * Safe for SSR: Returns null gracefully if connection is unavailable.
 */
export async function connectDB(): Promise<Db | null> {
  if (dbConnection) {
    return dbConnection;
  }
  
  if (!uri) {
    console.warn("MONGODB_URI environment variable is missing. Operating in fallback mode.");
    return null;
  }
  
  try {
    if (!client) {
      const { MongoClient } = await import('mongodb');
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    }
    await client.connect();
    // Defaulting database name to 'aquapro' which fits the application context
    dbConnection = client.db('aquapro');
    console.log("Successfully connected to MongoDB");
    return dbConnection;
  } catch (error: any) {
    console.error("MongoDB connection error (operating in local fallback):", error.message);
    return null;
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): any {
  return client;
}
