import React from "react";
import { X } from "lucide-react";
import type { InputState } from "@/types";

type SelectionButtonProps = {
  number: number;
  currentState: InputState;
  setCurrentState: (currentState: InputState) => void;
  setDraggingIndex: (index: number | null) => void;
  setHoveredIndex: (index: number | null) => void;
};

const SelectionButton: React.FC<SelectionButtonProps> = ({
  number,
  currentState,
  setCurrentState,
  setDraggingIndex,
  setHoveredIndex,
}) => {
  const removePoint = () => {
    console.log(
      number,
      currentState.points.filter((point) => point.label === number),
    );
    setCurrentState({
      ...currentState,
      points: currentState.points
        .filter((point) => point.label !== number)
        .map((point, index) => ({ ...point, label: index + 1 })),
    });
    setDraggingIndex(null);
    setHoveredIndex(null);
  };

  return (
    <button
      className="point-remove-btn rounded-lg p-1 me-2 cursor-pointer text-nowrap mb-2 hover:point-remove-btn"
      onClick={removePoint}
    >
      <span className="rounded-full border-white text-white border border-2 shadow-gray-500 shadow-sm bg-pink-500 w-6 h-6 inline-block text-center leading-5 shadow-sm me-1">
        {number}
      </span>
      <span className="text-sm font-medium">Image area</span>

      <X className="w-4 h-4 inline-block ms-1" />
    </button>
  );
};

export default SelectionButton;
