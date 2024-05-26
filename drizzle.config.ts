import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'node:path';
import { cwd } from 'node:process';


dotenv.config();

// We need to make sure the in the tsconfig.json file, we need to change the target at least to 'ES6'
export default {
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL!,
  },
};