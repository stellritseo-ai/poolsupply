import type { Db } from 'mongodb';

// Replace the uri string with your MongoDB deployment's connection string.
const uri = process.env.MONGODB_URI || "mongodb+srv://Pools_database_db_user:pPH0aCfvACpdl0vR@pools.4nsntwy.mongodb.net/?appName=Pools";

let client: any = null;
let dbConnection: Db | null = null;

/**
 * Connects to the MongoDB database and returns the Db instance.
 * Reuses the existing connection if it's already established.
 */
export async function connectDB(): Promise<Db> {
  if (dbConnection) {
    return dbConnection;
  }
  
  const maskedUri = uri.replace(/:([^@:]*)@/, ':******@');
  try {
    if (!client) {
      const { MongoClient } = await import('mongodb');
      client = new MongoClient(uri);
    }
    await client.connect();
    // Defaulting database name to 'aquapro' which fits the application context
    dbConnection = client.db('aquapro');
    console.log("Successfully connected to MongoDB");
    return dbConnection;
  } catch (error: any) {
    const diagMessage = `MongoDB connection failed. URI: ${maskedUri} | Length: ${uri.length} | startsWithQuotes: ${uri.startsWith('"') || uri.startsWith("'")} | endsWithQuotes: ${uri.endsWith('"') || uri.endsWith("'")} | isEnvVarSet: ${!!process.env.MONGODB_URI} | Error: ${error.message}`;
    console.error(diagMessage, error);
    throw new Error(diagMessage);
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): any {
  return client;
}
