import { NextRequest } from "next/server";
// import { like, not, sql } from "drizzle-orm";
import { sql } from "@vercel/postgres";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url || "");
  const room = searchParams.get("room");
  const str = sql`select * from chat where room = ${room}`

  const { rows } = await str

  return Response.json({
    data: rows,
  });
}
