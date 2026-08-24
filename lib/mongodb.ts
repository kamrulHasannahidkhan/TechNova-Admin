import mongoose from "mongoose";
import dns from "dns";

const DNS_SERVERS = ["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"];

dns.setDefaultResultOrder("ipv4first");

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(retries = 4, delayMs = 1500) {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
  }

  if (cached.promise) return cached.promise;

  cached.promise = (async () => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const server = DNS_SERVERS[(attempt - 1) % DNS_SERVERS.length];
      dns.setServers([server]);
      try {
        const conn = await mongoose.connect(MONGODB_URI, {
          dbName: "ecommerce",
          serverSelectionTimeoutMS: 8000,
        });
        console.log("MongoDB connected via DNS server:", server);
        return conn;
      } catch (err) {
        console.error(`MongoDB connection attempt ${attempt} failed (DNS: ${server}):`, err);
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, delayMs));
        } else {
          cached.promise = null;
          throw err;
        }
      }
    }
  })();

  cached.conn = await cached.promise;
  return cached.conn;
}
