"use client";

import { useReducer } from "react";
import { chatReducer } from "./ChatReducer";
import { ChatContext, ChatContextProps } from "./ChatContext";
import { useRouter } from "next/navigation";

export const CHAT_ROOM_NAME = "chat-room-name";

enum ApiRoutes {
  SSE = "/api/sse",
  Message = "/api/sse",
}

export type ChatProviderProps = {
  children: React.ReactNode;
};

export function ChatProvider({ children }: ChatProviderProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(chatReducer, {
    displayName: "",
    displayEmail: "111@222",
    roomId: undefined,
    messages: [],
  });

  const onUpdateDisplayName: ChatContextProps["onUpdateDisplayName"] = (
    name
  ) => {
    dispatch({
      type: "set_display_name",
      payload: name,
    });
  };

  const onUpdateDisplayEmail: ChatContextProps["onUpdateDisplayEmail"] = (
    name
  ) => {
    dispatch({
      type: "set_display_email",
      payload: name,
    });
  };

  const onEnterRoom: ChatContextProps["onEnterRoom"] = async (roomId) => {
    const snakeCaseRoomId = roomId.toLowerCase().split(" ").join("_");
    dispatch({
      type: "set_room_id",
      payload: snakeCaseRoomId,
    });
    const queryParams = new URLSearchParams({
      id: snakeCaseRoomId,
    });
    router.push(`/chat?${queryParams.toString()}`);
  };

  const onSendMessage: ChatContextProps["onSendMessage"] = async (message) => {
    await fetch(ApiRoutes.Message, {
      method: "POST",
      body: JSON.stringify({
        id: state.roomId,
        name: state.displayName,
        email: state.displayEmail,
        message,
      }),
    });
  };

  const onReceivedMessage: ChatContextProps["onReceivedMessage"] = (
    message
  ) => {
    console.log("[chat-context] onReceivedMessage", message);
    dispatch({
      type: "on_received_message",
      payload: message,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        displayName: state.displayName,
        roomId: state.roomId,
        messages: state.messages,
        onUpdateDisplayName,
        onUpdateDisplayEmail,
        onEnterRoom,
        onSendMessage,
        onReceivedMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
