import { InferModelFromColumns, sql, InferModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("chat", {
  room: text("title").notNull(),
  uname: text("uname").notNull(),
  nmail: text("umail").notNull(),
  message: text("message").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});



export type Post = InferModel<typeof notes>;