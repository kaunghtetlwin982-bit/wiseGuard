import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  mongoDBName: string;
  JWT_SECRET: string;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}


console.log("Loading configuration from environment variables...",{
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD,
  },
})

// Validate and parse environment variables
const config: Config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/blog",
  mongoDBName : process.env.mongoDBName || "vpn",
  JWT_SECRET: process.env.JWT_SECRET  || "",
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

export default config;
