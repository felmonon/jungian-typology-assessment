import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { requireEnvValue } from "./env";

neonConfig.webSocketConstructor = ws;

const databaseUrl = requireEnvValue("DATABASE_URL");

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
