import type { Db, MongoClient } from "mongodb";
import dns from "node:dns";

// Configure high-reliability public DNS resolvers for MongoDB Atlas SRV lookup
try {
  if (typeof dns?.setServers === "function") {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
  }
} catch {
  // Ignore in browser or edge contexts
}

function getMongoUri(): string {
  const globalProc = (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;

  const uri =
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    globalProc?.env?.MONGODB_URI ||
    globalProc?.env?.DATABASE_URL;

  if (typeof uri === "string" && uri.trim()) {
    return uri.trim();
  }

  return "";
}

let client: MongoClient | null = null;
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
  if (!uri) {
    console.warn("[DB] MONGODB_URI environment variable is not defined in environment.");
    return null;
  }

  try {
    if (!client) {
      const { MongoClient: MongoCls } = await import("mongodb");
      client = new MongoCls(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    }
    await client.connect();
    // Defaulting database name to 'aquapro' which fits the application context
    dbConnection = client.db("aquapro");
    console.log("Successfully connected to MongoDB (aquapro)");
    return dbConnection;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("MongoDB connection error:", message);
    client = null;
    dbConnection = null;
    return null;
  }
}

/**
 * Returns the underlying MongoClient instance.
 */
export function getClient(): MongoClient | null {
  return client;
}
