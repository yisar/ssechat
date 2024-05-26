import { InferModel, sql } from 'drizzle-orm';

import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const notes = pgTable("chat", {
  room: text("room"),
  uname: text("uname"),
  nmail: text("umail"),
  message: text("message"),
  time: timestamp("time")
    .default(sql`CURRENT_TIMESTAMP`),
});



export type Post = InferModel<typeof notes>;