"use client";

import { DOMAttributes, useMemo, useRef } from "react";
import { useChatContext } from "@/contexts/ChatContext";

export function RoomInput() {
  const chat = useChatContext();
  const roomNameRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const displayEmailRef = useRef<HTMLInputElement>(null);

  const onEnter: DOMAttributes<HTMLButtonElement>["onClick"] = (e) => {
    e.preventDefault();
    if (!roomNameRef.current?.value || !displayNameRef.current?.value || !displayEmailRef.current?.value) {
      alert("都得填")
      return
    }
    chat.onUpdateDisplayName(displayNameRef.current.value);
    chat.onUpdateDisplayEmail(displayEmailRef.current.value);
    chat.onEnterRoom([
      displayNameRef.current.value, roomNameRef.current.value]
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'accent' }))
      .join('::'));
  };
  return (
    <div className="mt-6 flex max-w-md gap-x-4 flex flex-col gap-y-4">

      <label>你的名字</label>
      <input
        ref={displayNameRef}
        name="display-name"
        type="text"
        className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        placeholder="e.g 伊撒尔"
      />

      <label>你的邮箱</label>
      <input
        ref={displayEmailRef}
        name="display-email"
        type="text"
        className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        placeholder="e.g 1533540012@qq.com"
      />

      <label>对方的名字</label>
      <input
        ref={roomNameRef}
        name="room-name"
        type="text"
        className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        placeholder="e.g 公主"
      />

      <button
        type="submit"
        className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        onClick={onEnter}
      >
        开始聊天
      </button>
    </div>
  );
}
