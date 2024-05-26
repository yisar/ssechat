import { NextRequest } from "next/server";
import { StreamAlreadyExistsError } from "./errors";

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
    rooms: Object.keys((globalThis as any).streams).length,
  });

  setTimeout(async () => {
    await stream.writer.write(encoder.encode(`Stream open!\n\n`));
    console.log(Object.keys((globalThis as any).streams).length)
  }, 2000);

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

type InMemoryStream = {
  stream: TransformStream;
  readable: ReadableStream;
  writer: WritableStreamDefaultWriter;
};

type Participants = Record<string, InMemoryStream>;

(globalThis as any).streams = {} as any;

export type StreamIdentifierArgs = {
  roomId: string;
  name: string;
};

export function getStreamKeyForUser(args: StreamIdentifierArgs) {
  return `${args.roomId}::${args.name}`;
}

export function getStreamParticipantsForRoom(
  roomId: string
): Participants | undefined {
  return (globalThis as any).streams[roomId];
}

export function getStreamForUser(
  args: StreamIdentifierArgs
): InMemoryStream | undefined {
  const room = getStreamParticipantsForRoom(args.roomId);
  return room?.[args.name];
}

export function createStreamForUser(
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
    (globalThis as any).streams[args.roomId] = {
      [args.name]: inMemoryStream,
    };
  }
  return inMemoryStream;
}

export function removeStreamForUser(args: { roomId: string; name: string }) {}