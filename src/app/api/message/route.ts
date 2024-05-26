import { NextRequest } from "next/server";
import {
  StreamNotFoundError,
  StreamUnidentifiableMissingRequirementsError,
} from "../sse/errors";
import { getStreamForUser, getStreamKeyForUser } from "../sse/streams";
import { broadcastMessageInRoom } from "../sse/broadcast";
import { db } from "@/db";
import { notes } from "@/db/schema";

export async function POST(request: NextRequest) {
  const { id, name, message, email } = await request.json();
  if (!id || !name || !message || !email) {
    throw new StreamUnidentifiableMissingRequirementsError();
  }

  console.log("[api] message received", {
    id,
    name,
    message,
    availableRooms: Object.keys((globalThis as any).streams),
  });

  let stream = getStreamForUser({ roomId: id, name });

  if (!stream) {
    const key = getStreamKeyForUser({ roomId: id, name });
    const error = new StreamNotFoundError(key);
    return Response.json(
      {
        data: {
          message: error.message,
        },
      },
      { status: 404 }
    );
  }

  await broadcastMessageInRoom({ roomId: id, from: name, message });

  await addMessage(id, name, message, email)

  return Response.json({
    data: {
      message: "Message sent",
    },
  });
}

const addMessage = async (room: string, name: string, message: string, email: string) => {
  const time = new Date()
  await db.insert(notes)
    .values({
      room,
      uname: name,
      umail: email,
      message,
      time 
    } as any);
};