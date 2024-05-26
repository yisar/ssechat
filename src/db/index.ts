import * as schema from './schema';
import path from 'node:path';
import { cwd } from 'node:process';

import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from "@vercel/postgres";


// const dbpath = path.join(cwd(), 'tmp/acgzone.db')

export const db = drizzle(sql, { schema });