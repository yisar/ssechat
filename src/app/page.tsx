import { RoomInput } from "@/components/RoomInput";
import { db } from "@/db";
import { notes } from "@/db/schema";

export default async function Index() {
  const allNotes = await db.select().from(notes);
  console.log(allNotes)

  return (
    <div className="max-w-xl lg:max-w-lg">
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Welcome to Inbox.
      </h2>
      <p className="mt-4 text-lg leading-8 text-gray-300">
        Please provide your name before seeing the conversations.
      </p>
      <RoomInput />
    </div>
  );
}
