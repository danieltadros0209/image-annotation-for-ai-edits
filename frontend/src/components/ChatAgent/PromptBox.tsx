import React from "react";

import { ChevronDown, Paperclip, ArrowUp } from "lucide-react";
import { toast } from "react-toastify";

import SelectionButton from "./SelectionButton";
import type { Point, InputState, Chat } from "@/types";
import { getBlobImage } from "@/utils";
import * as API from "@/api";

type PromptBoxProps = {
  setLoading: (loading: boolean) => void;
  setDraggingIndex: (index: number | null) => void;
  setHoveredIndex: (index: number | null) => void;
  setErrors: React.Dispatch<React.SetStateAction<{error: string | null}>>;
  prevState: InputState;
  setPrevState: (prevState: InputState) => void;
  currentState: InputState;
  setCurrentState: (currentState: InputState) => void;
  redoState: InputState;
  setRedoState: (redoState: InputState) => void;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  setShowSidebar: (showSidebar: boolean) => void;
  setSidebarVisible: (sidebarVisible: boolean) => void;
};

const PromptBox: React.FC<PromptBoxProps> = ({
  setLoading,
  setDraggingIndex,
  setHoveredIndex,
  setPrevState,
  setErrors,
  currentState,
  setCurrentState,
  setRedoState,
  setChats,
  setShowSidebar,
  setSidebarVisible,
}) => {
  const selectionButtonGroup = currentState.points.map(
    (point: Point, index) => (
      <SelectionButton
        key={index}
        number={point.label}
        setCurrentState={setCurrentState}
        setDraggingIndex={setDraggingIndex}
        setHoveredIndex={setHoveredIndex}
        currentState={currentState}
      />
    ),
  );

  const onClickImageUploadBtn = () => {
    const uploadImageForm = document.getElementById("image-upload-form");

    uploadImageForm?.click();
  };

  const onChangeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSidebar(true);
    setSidebarVisible(true);
    setLoading(true);

    const fileUploadForm = e.target;
    const img = new Image();

    if (!fileUploadForm.files?.[0]) return;

    img.src = URL.createObjectURL(fileUploadForm.files[0]);
    img.onload = () => {
      setCurrentState({ ...currentState, image: img, points: [] });
      setLoading(false);
    };
  };

  const onChangePrompt = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const promptForm = e.target;

    promptForm.style.height = "auto";

    const lineHeight = 24;
    const maxLines = 5;
    const maxHeight = lineHeight * maxLines;

    promptForm.style.height =
      Math.min(promptForm.scrollHeight, maxHeight) + "px";

    setCurrentState({ ...currentState, prompt: e.target.value });
  };

  const submit = async () => {
    if (
      !currentState.image ||
      currentState.points.length < 3 ||
      !currentState.prompt
    )
      return null;

    setLoading(true);

    const image = await getBlobImage(currentState.image, currentState.points);
    const chatImage = await getBlobImage(
      currentState.image,
      currentState.points,
      false,
    );
    const formData = new FormData();
    const chatImageElement = new Image();

    chatImageElement.src = URL.createObjectURL(chatImage);

    formData.append("image", image, "canvas.png");
    formData.append("prompt", currentState.prompt);

    setPrevState({ image: currentState.image, points: [], prompt: "" });
    setRedoState({ ...currentState });

    chatImageElement.onload = () => {
      setChats((prev) => {
        return [
          ...prev,
          {
            prompt: currentState.prompt,
            uploadedImage: chatImageElement,
            type: "user_request",
          },
        ];
      });
    };

    API.generateImage(formData, { responseType: "blob" })
      .then((res) => {
        const img = new Image();

        img.src = URL.createObjectURL(res.data);

        img.onload = () => {
          setChats((prev) => {
            return [...prev, { generatedImage: img, type: "ai_response" }];
          });
          setCurrentState({
            image: img,
            prompt: "",
            points: [],
          });

          setLoading(false);
          setErrors({error: null});
          toast.success("AI Image Generated Successfully");
        };
      })
      .catch(async (err) => {
        if (err.response?.data instanceof Blob) {
          const _errors = await err.response.data.text();

          setErrors(JSON.parse(_errors));
        } else {
          console.error("Error:", err.message);
        }

        setLoading(false);
      });
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      submit();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 shadow-lg py-2 px-6">
      {currentState.points.length > 0 && (
        <div className="w-full overflow-auto max-h-60">
          {selectionButtonGroup}
        </div>
      )}

      {currentState.points.length > 2 && (
        <textarea
          name="prompt"
          id="prompt"
          placeholder="Type a message"
          className="p-2 w-full resize-none focus:outline-none focus:ring-0 focus:border-transparent leading-6 min-h-[1.5rem] max-h-[7.5rem]"
          rows={1}
          value={currentState.prompt}
          onChange={onChangePrompt}
          onKeyDown={handleEnter}
        />
      )}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button className="text-gray-500 cursor-pointer me-2 px-2 py-1 rounded-full hover:bg-gray-200">
            Auto <ChevronDown className="w-4 h-4 inline" />
          </button>
          <button
            className="text-gray-500 cursor-pointer hover:bg-gray-200 p-2 rounded-full"
            onClick={onClickImageUploadBtn}
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <div>
          <input
            type="file"
            className="hidden"
            id="image-upload-form"
            onChange={onChangeImageUpload}
          />
          <button
            className="cursor-pointer bg-gray-300 text-gray-600 hover:bg-gray-400 h-8 w-8 rounded-full flex justify-center items-center"
            onClick={submit}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptBox;
