import { NextRequest } from "next/server";
import { StreamNotFoundError } from "./errors";
import {
  StreamUnidentifiableMissingRequirementsError,
} from "../sse/errors";

import { db } from "@/db";
import { notes } from "@/db/schema";

const streams = {} as any;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url || "");
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  if (!id || !name) {
    // throw new Error("Missing id or name");
    return new Response("Missing id or name");
  }

  createStreamForUser({ roomId: id, name });

  let stream = getStreamForUser({ roomId: id, name })!;
  const encoder = new TextEncoder();

  console.log("[sse] create stream", {
    id,
    name,
    rooms: Object.keys(streams).length,
  });

  setTimeout(async () => {
    await stream.writer.write(encoder.encode(`Stream open!\n\n`));
    console.log(Object.keys(streams).length)
  }, 2000);

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

import { StreamAlreadyExistsError } from "./errors";

type InMemoryStream = {
  stream: TransformStream;
  readable: ReadableStream;
  writer: WritableStreamDefaultWriter;
};

type Participants = Record<string, InMemoryStream>;

type StreamIdentifierArgs = {
  roomId: string;
  name: string;
};

function getStreamKeyForUser(args: StreamIdentifierArgs) {
  return `${args.roomId}::${args.name}`;
}

function getStreamParticipantsForRoom(
  roomId: string
): Participants | undefined {
  return streams[roomId];
}

function getStreamForUser(
  args: StreamIdentifierArgs
): InMemoryStream | undefined {
  const room = getStreamParticipantsForRoom(args.roomId);
  return room?.[args.name];
}

function createStreamForUser(
  args: StreamIdentifierArgs
): InMemoryStream {
  const room = getStreamParticipantsForRoom(args.roomId);
  let stream = new TransformStream();
  let inMemoryStream: InMemoryStream = {
    stream,
    readable: stream.readable,
    writer: stream.writable.getWriter(),
  };
  if (room) {
    const existingStream = getStreamForUser(args);
    if (existingStream) {
      const key = getStreamKeyForUser(args);
      throw new StreamAlreadyExistsError(key);
    }
    room[args.name] = inMemoryStream;
  } else {
    streams[args.roomId] = {
      [args.name]: inMemoryStream,
    };
  }
  return inMemoryStream;
}


type BroadcastMessage = {
  sender: string;
  text: string;
  receivedAt: number;
};

type BroadcastMessageInRoomProps = {
  roomId: string;
  from: string;
  message: string;
};

async function broadcastMessageInRoom(
  props: BroadcastMessageInRoomProps
) {
  const { roomId, from, message } = props;
  const room = getStreamParticipantsForRoom(roomId);
  if (!room) {
    const key = getStreamKeyForUser({ roomId, name: from });
    throw new StreamNotFoundError(key);
  }

  const participantIds = Object.keys(room);
  console.log("broadcast to", {
    keys: Object.keys(room),
  });
  for (const id in participantIds) {
    const data: BroadcastMessage = {
      sender: from,
      text: message,
      receivedAt: Date.now(),
    };
    await room[participantIds[id]].writer.write(`event: message\n`);
    await room[participantIds[id]].writer.write(
      `data: ${JSON.stringify(data)}\n\n`
    );
  }
}

export async function POST(request: NextRequest) {
  const { id, name, message, email } = await request.json();
  if (!id || !name || !message || !email) {
    throw new StreamUnidentifiableMissingRequirementsError();
  }

  console.log("[api] message received", {
    id,
    name,
    message,
    availableRooms: Object.keys(streams || {}),
  });

  console.log(streams)

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