import { useEffect, useState } from "react";

import { ToastContainer, toast } from "react-toastify";

import { ChatAgent } from "@/components/ChatAgent";
import { ResultBox } from "@/components/ResultBox";

import { ArrowLeft, ChevronDown, MoreHorizontal } from "lucide-react";
import type { InputState, Chat } from "@/types";

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentState, setCurrentState] = useState<InputState>({
    image: null,
    prompt: "",
    points: [],
  });
  const [prevState, setPrevState] = useState<InputState>({
    image: null,
    prompt: "",
    points: [],
  });
  const [redoState, setRedoState] = useState<InputState>({
    image: null,
    prompt: "",
    points: [],
  });
  const [errors, setErrors] = useState<{error: string | null}>({error: null});

  useEffect(() => {
    if (errors['error']) toast.error(errors['error']);
  }, [errors]);

  return (
    <>
      <div className="h-screen w-full overflow-hidden relative">
        {!sidebarVisible && (
          <button
            onClick={() => {
              setSidebarVisible(true);
              setShowSidebar(true);
            }}
            className="
            fixed top-1/2 right-0 z-50
            rounded-l-xl text-gray-600 bg-white
            px-2 py-2 text-sm shadow-md shadow-gray-300 border border-gray-200
            hover:bg-gray-200 -translate-y-1/2
          "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div
          className={`
          grid h-screen
          transition-[grid-template-columns] duration-600 ease-in-out
          ${showSidebar ? "grid-cols-[1fr_2fr]" : "grid-cols-[1fr_0fr]"}
        `}
        >
          {/* ChatAgent (container-based) */}
          <div className="h-full overflow-hidden">
            <div className="shrink-0 shadow-md">
              <div className="flex justify-between h-full overflow-hidden mx-auto max-w-7xl px-4 py-2">
                <button className="text-zinc-600 hover:bg-gray-200 p-2 rounded-sm cursor-pointer">
                  Agent Chat{" "}
                  <ChevronDown className="w-5 h-5 text-zinc-600 inline hover:text-blue-500 cursor-pointer" />
                </button>
                <button className="cursor-pointer text-zinc-600 hover:bg-gray-200 p-2 rounded-sm">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-[calc(100vh-56px)] overflow-hidden mx-auto max-w-7xl p-4">
              <ChatAgent
                loading={loading}
                setLoading={setLoading}
                setHoveredIndex={setHoveredIndex}
                setDraggingIndex={setDraggingIndex}
                prevState={prevState}
                currentState={currentState}
                setCurrentState={setCurrentState}
                setPrevState={setPrevState}
                setErrors={setErrors}
                redoState={redoState}
                setRedoState={setRedoState}
                chats={chats}
                setChats={setChats}
                setShowSidebar={setShowSidebar}
                setSidebarVisible={setSidebarVisible}
              />
            </div>
          </div>

          {/* Sidebar column */}
          <div className="relative h-full">
            {/* Sidebar content — slides relative to column */}
            <div
              className={`
              absolute
              bg-white shadow-lg p-4
              transform transition-transform duration-600 ease-in-out
              h-full w-full
              ${showSidebar ? "translate-x-0" : "translate-x-full"}
            `}
              onTransitionEnd={() => {
                if (!showSidebar) {
                  setSidebarVisible(false);
                }
              }}
            >
              <ResultBox
                loading={loading}
                draggingIndex={draggingIndex}
                setDraggingIndex={setDraggingIndex}
                hoveredIndex={hoveredIndex}
                setHoveredIndex={setHoveredIndex}
                errors={errors}
                setLoading={setLoading}
                setErrors={setErrors}
                prevState={prevState}
                setPrevState={setPrevState}
                currentState={currentState}
                setCurrentState={setCurrentState}
                redoState={redoState}
                setRedoState={setRedoState}
                setShowBar={setShowSidebar}
                setChats={setChats}
              />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" closeButton autoClose={3000} />
    </>
  );
}

export default App;
