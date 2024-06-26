import { InferModel, sql } from 'drizzle-orm';

import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const notes = pgTable("chat", {
  id: text("id").notNull(),
  room: text("room").notNull(),
  uname: text("uname").notNull(),
  umail: text("umail").notNull(),
  message: text("message").notNull(),
  time: text('time').notNull(),
});



export type Post = InferModel<typeof notes>;