import type { Point } from "@/types";

export const getBlobImage = (
  image: HTMLImageElement,
  points: Point[],
  isRequestImage: boolean = true,
  options?: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    mimeType?: "image/png" | "image/jpeg";
    quality?: number;
  },
): Promise<Blob> => {
  const {
    fillColor = isRequestImage ? "#ffffff00" : "#f6339b51",
    strokeColor = "#f6339a",
    strokeWidth = 2,
    mimeType = "image/png",
    quality = 0.92,
  } = options || {};

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    // Draw base image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw polygon ONLY (no points)
    if (points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";

      ctx.fill();
      ctx.stroke();
    }

    // Export to Blob
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      mimeType === "image/jpeg" ? quality : undefined,
    );
  });
};

export const POINT_RADIUS_SCREEN = 16;

export const drawPointOnImage = (
    ctx: CanvasRenderingContext2D,
    point: Point,
    active: boolean,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = active ? "#ffffff" : "#f6339a";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2 * (radius / POINT_RADIUS_SCREEN);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = active ? "#f6339a" : "#ffffff";
    ctx.font = `bold ${12 * (radius / POINT_RADIUS_SCREEN)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(point.label), point.x, point.y);
  };