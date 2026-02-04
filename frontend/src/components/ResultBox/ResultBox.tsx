import React, { useEffect, useRef } from "react";
import {
  ChevronRight,
  X,
  MessageSquarePlus,
  Copy,
  Download,
  Undo,
  RotateCcw,
} from "lucide-react";

import type { InputState, Chat } from "@/types";
import { getBlobImage, drawPointOnImage, POINT_RADIUS_SCREEN } from "@/utils";
import * as API from "@/api";

type ResultBoxProps = {
  loading: boolean;
  draggingIndex: number | null;
  setDraggingIndex: (draggingIndex: number | null) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (hoveredIndex: number | null) => void;
  errors: {error: string | null};
  setLoading: (loading: boolean) => void;
  setErrors: React.Dispatch<React.SetStateAction<{error: string | null}>>;
  prevState: InputState;
  setPrevState: (prevState: InputState) => void;
  currentState: InputState;
  setCurrentState: (currentState: InputState) => void;
  redoState: InputState;
  setRedoState: (redoState: InputState) => void;
  setShowBar: (showBar: boolean) => void;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
};

const ResultBox: React.FC<ResultBoxProps> = ({
  loading,
  draggingIndex,
  setDraggingIndex,
  hoveredIndex,
  setHoveredIndex,
  setLoading,
  setErrors,
  setPrevState,
  prevState,
  currentState,
  setCurrentState,
  redoState,
  setShowBar,
  setChats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentState.image) return;

    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const scale = Math.max(scaleX, scaleY);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentState.image, 0, 0, canvas.width, canvas.height);

    if (currentState.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentState.points[0].x, currentState.points[0].y);
      currentState.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();

      // ctx.fillStyle = "#f6339b76";
      ctx.fillStyle = "#ffffff00";
      ctx.strokeStyle = "#f6339a";
      ctx.lineWidth = 2 * scale;
      ctx.lineJoin = "round";

      ctx.fill();
      ctx.stroke();
    }

    currentState.points.forEach((p, i) => {
      drawPointOnImage(
        ctx,
        p,
        i === draggingIndex || i === hoveredIndex,
        POINT_RADIUS_SCREEN * scale,
      );
    });
  }, [currentState.image, currentState.points, draggingIndex, hoveredIndex]);

  /* helpers */
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const getPointIndexAtPosition = (pos: { x: number; y: number }) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;

    const hitRadius = POINT_RADIUS_SCREEN * scale;

    return currentState.points.findIndex((p) => {
      const dx = p.x - pos.x;
      const dy = p.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
    });
  };

  /* mouse events */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (loading) return;

    const pos = getMousePos(e);
    const index = getPointIndexAtPosition(pos);

    if (index !== -1) {
      setDraggingIndex(index);
    } else {
      const currentStatePoints = [
        ...currentState.points,
        { x: pos.x, y: pos.y, label: currentState.points.length + 1 },
      ];

      setCurrentState({ ...currentState, points: currentStatePoints });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (loading) return;

    const pos = getMousePos(e);

    if (draggingIndex !== null) {
      const currentStatePoints = currentState.points.map((p, i) =>
        i === draggingIndex ? { ...p, x: pos.x, y: pos.y } : p,
      );

      setCurrentState({ ...currentState, points: currentStatePoints });

      return;
    }

    const index = getPointIndexAtPosition(pos);
    setHoveredIndex(index !== -1 ? index : null);
  };

  const handleMouseUp = () => {
    console.log("mouseup");
    if (loading) return;

    setDraggingIndex(null);
  };

  const undo = () => {
    setCurrentState({ ...prevState });
    setPrevState({ image: null, points: [], prompt: "" });
  };

  const redo = async () => {
    setCurrentState({ ...redoState });
    if (!redoState.image || redoState.points.length < 3 || !redoState.prompt)
      return null;

    setLoading(true);

    const image = await getBlobImage(redoState.image, redoState.points);

    const formData = new FormData();

    formData.append("image", image, "canvas.png");
    formData.append("prompt", redoState.prompt);

    API.generateImage(formData, {
      responseType: "blob",
    })
      .then((res) => {
        const img = new Image();

        img.src = URL.createObjectURL(res.data);

        img.onload = () => {
          setPrevState({
            image: redoState.image,
            points: [],
            prompt: "",
          });

          setChats((prev) => {
            return [...prev, { generatedImage: img, type: "ai_response" }];
          });
          setCurrentState({ image: img, points: [], prompt: "" });
          setLoading(false);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center">
        <button
          className="text-gray-500 hover:bg-gray-200 rounded-sm cursor-pointer content-center me-4 p-2"
          onClick={() => setShowBar(false)}
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-gray-400">New PDP Assets</span>
        <span className="pt-0.5 ms-1">
          <ChevronRight className="w-4 h-4" />
        </span>
        <span>PDP asset v1</span>
      </div>
      <div className="grow min-h-0">
        <div className="flex h-full items-center">
          <div className="flex flex-col rounded-full bg-black px-1 py-3 h-fit">
            <button
              className={`text-white size-fit mb-1 p-1.5 ${!loading ? "cursor-pointer hover:bg-gray-700 rounded-full" : "cursor-not-allowed"}`}
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
            <button
              className={`text-white size-fit mb-1 p-1.5 ${!loading ? "cursor-pointer  hover:bg-gray-700 rounded-full" : "cursor-not-allowed"}`}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className={`text-white size-fit p-1.5 ${!loading ? "cursor-pointer  hover:bg-gray-700 rounded-full" : "cursor-not-allowed"}`}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col min-h-0">
            <div className="flex-1 p-6 flex justify-center relative min-h-0">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </div>
              )}
              <div className="max-w-xl w-full">
                {currentState.image && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="h-full flex flex-col items-center justify-center">
                      <div
                        className="max-w-full max-h-full rounded-md bg-white overflow-hidden"
                        style={{
                          aspectRatio: `${currentState.image.width} / ${currentState.image.height}`,
                        }}
                      >
                        <canvas
                          ref={canvasRef}
                          width={currentState.image.width}
                          height={currentState.image.height}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={() => {
                            setDraggingIndex(null);
                            setHoveredIndex(null);
                          }}
                          style={{
                            cursor:
                              draggingIndex !== null
                                ? "grabbing"
                                : hoveredIndex !== null
                                  ? "pointer"
                                  : "crosshair",
                          }}
                          className="w-full h-full block"
                        />
                      </div>
                      {!loading && (
                        <div className="flex justify-center items-center mt-4">
                          {prevState.image && (
                            <>
                              <button
                                className="mx-1 text-zinc-600 cursor-pointer rounded-sm p-2 hover:bg-gray-200"
                                onClick={undo}
                              >
                                <Undo className="w-6 h-6" />
                              </button>
                              <button
                                className="mx-1 text-zinc-600 cursor-pointer rounded-sm p-2 hover:bg-gray-200"
                                onClick={redo}
                              >
                                <RotateCcw className="w-6 h-6" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultBox;
