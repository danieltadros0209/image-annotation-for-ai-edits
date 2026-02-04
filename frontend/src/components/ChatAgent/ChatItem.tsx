import React from "react";

import ResponsiveButtonGroup from "./ResponseButtonGroup";
import type { Chat } from "@/types";

type ChatItemProps = {
  chat: Chat;
  loading: boolean;
};

const ChatItem: React.FC<ChatItemProps> = ({ chat, loading }) => {
  return (
    <>
      {chat.type === "user_request" && (
        <div className="text-right">
          <p className="mb-4 max-w-3/4 ml-auto w-fit">{chat.prompt}</p>
          <div className="w-full max-h-64 overflow-hidden flex items-center justify-end mb-4">
            <img
              src={chat.uploadedImage.src}
              className="max-h-64 object-contain rounded"
              alt=""
            />
          </div>
        </div>
      )}
      {chat.type === "ai_response" && (
        <div>
          <div>
            <div className="w-full max-h-64 overflow-hidden flex items-center mb-4">
              <img
                src={chat.generatedImage.src}
                className="max-h-64 object-contain rounded"
                alt=""
              />
            </div>
            <div className="mb-4">
              <ResponsiveButtonGroup loading={loading} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatItem;
