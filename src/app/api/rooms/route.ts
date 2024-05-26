import { NextRequest } from "next/server";
// import { like, not, sql } from "drizzle-orm";
import { sql } from "@vercel/postgres";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url || "");
  const uname = searchParams.get("uname");
  const str = sql`select
  t1.id,
	t1.room,
	t1.umail,
	t1.message
from
	chat t1
inner join (
	select
		max(id) as id
	from
		chat
  where
    room like ${'%'+uname+'%'}
	group by
		room) t2 on
	t1.id = t2.id`

 const {rows} = await str

  return Response.json({
    data: {
      rooms:rows,
    },
  });
}
