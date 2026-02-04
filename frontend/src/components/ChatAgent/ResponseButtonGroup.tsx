import React from "react";
import {
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Copy,
} from "lucide-react";

type ResponseButtonGroupProps = {
  loading: boolean;
};

type ResponseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

const ResponseButton: React.FC<ResponseButtonProps> = ({
  loading,
  children,
}) => (
  <button
    className={`
          p-2 rounded-sm
          ${
            !loading
              ? "hover:bg-gray-200 cursor-pointer"
              : "cursor-not-allowed text-gray-300"
          }`}
  >
    {children}
  </button>
);

const ResponseButtonGroup: React.FC<ResponseButtonGroupProps> = ({
  loading,
}) => {
  return (
    <div className="flex items-center text-zinc-600">
      <ResponseButton loading={loading}>
        <ThumbsUp className="w-4 h-4" />
      </ResponseButton>
      <ResponseButton loading={loading}>
        <ThumbsDown className="w-4 h-4" />
      </ResponseButton>
      <ResponseButton loading={loading}>
        <MessageSquare className="w-4 h-4" />
      </ResponseButton>
      <ResponseButton loading={loading}>
        <Copy className="w-4 h-4" />
      </ResponseButton>
      <ResponseButton loading={loading}>
        <MoreHorizontal className="w-4 h-4" />
      </ResponseButton>
    </div>
  );
};

export default ResponseButtonGroup;
