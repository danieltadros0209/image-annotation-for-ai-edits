import React from "react";

import PromptBox from "./PromptBox";
import ChatItem from "./ChatItem";

import type { InputState, Chat } from "@/types";

type ChatAgentProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setDraggingIndex: (index: number | null) => void;
  setHoveredIndex: (index: number | null) => void;
  setErrors: React.Dispatch<React.SetStateAction<{error: string | null}>>;
  setCurrentState: (currentState: InputState) => void;
  setPrevState: (prevState: InputState) => void;
  prevState: InputState;
  currentState: InputState;
  redoState: InputState;
  setRedoState: (redoState: InputState) => void;
  setShowSidebar: (showSidebar: boolean) => void;
  chats: Chat[];
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setSidebarVisible: (sidebarVisible: boolean) => void;
};

const ChatAgent: React.FC<ChatAgentProps> = ({
  loading,
  setLoading,
  setDraggingIndex,
  setHoveredIndex,
  setErrors,
  prevState,
  currentState,
  setPrevState,
  setCurrentState,
  redoState,
  setRedoState,
  chats,
  setChats,
  setShowSidebar,
  setSidebarVisible,
}) => {
  const chatItems = chats.map((chat: Chat, index) => (
    <ChatItem key={index} chat={chat} loading={loading} />
  ));

  return (
    <div className="flex flex-col overflow-hidden h-full overflow-visible">
      {/* Scrollable chat area */}
      <div className="flex-1 min-h-0 space-y-2 scroll-on-hover">
        <div className="mb-4 shrink-0">
          <img src="/images/icon.png" className="w-12 h-12" alt="icon" />
        </div>
        {chatItems}
      </div>

      {/* Bottom input */}
      <div
        className={`shrink-0 transition-opacity ${
          loading ? "pointer-events-none opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <PromptBox
          setLoading={setLoading}
          setDraggingIndex={setDraggingIndex}
          setHoveredIndex={setHoveredIndex}
          prevState={prevState}
          setPrevState={setPrevState}
          setErrors={setErrors}
          currentState={currentState}
          setCurrentState={setCurrentState}
          redoState={redoState}
          setRedoState={setRedoState}
          setChats={setChats}
          setShowSidebar={setShowSidebar}
          setSidebarVisible={setSidebarVisible}
        />
      </div>
    </div>
  );
};

export default ChatAgent;
