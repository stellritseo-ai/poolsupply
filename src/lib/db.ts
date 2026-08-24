import type { Db } from 'mongodb';
import dns from 'node:dns';

// Configure high-reliability public DNS resolvers for MongoDB Atlas SRV lookup
try {
  if (typeof dns?.setServers === 'function') {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
  }
} catch (e) {
  // Ignore in browser or edge contexts
}

function getMongoUri(): string {
  const uri =
    process.env.MONGODB_URI ||
    (typeof (globalThis as any).process !== "undefined" ? (globalThis as any).process?.env?.MONGODB_URI : undefined);

  if (typeof uri === "string" && uri.trim()) {
    return uri.trim();
  }

  // SECURITY NOTICE: Set MONGODB_URI in your .env file.
  // This direct replica set URI is the fallback for local dev only.
  // It avoids SRV DNS lookup failures in the Vite SSR environment.
  // DO NOT commit real credentials to source control.
  console.warn("[DB] MONGODB_URI env var not found — using built-in connection. Set MONGODB_URI in .env for production.");
  return "mongodb://Pools_database_db_user:pPH0aCfvACpdl0vR@ac-va6mgh5-shard-00-00.4nsntwy.mongodb.net:27017,ac-va6mgh5-shard-00-01.4nsntwy.mongodb.net:27017,ac-va6mgh5-shard-00-02.4nsntwy.mongodb.net:27017/?ssl=true&replicaSet=atlas-jbantw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Pools";
}

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

  const uri = getMongoUri();

  try {
    if (!client) {
      const { MongoClient } = await import('mongodb');
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    }
    await client.connect();
    // Defaulting database name to 'aquapro' which fits the application context
    dbConnection = client.db('aquapro');
    console.log("Successfully connected to MongoDB (aquapro)");
    return dbConnection;
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    client = null;
    dbConnection = null;
    return null;
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): any {
  return client;
}
