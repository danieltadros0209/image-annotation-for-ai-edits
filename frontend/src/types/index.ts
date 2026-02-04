export type Point = {
  x: number;
  y: number;
  label: number;
};

export type InputState = {
  image: HTMLImageElement | null;
  prompt: string;
  points: Point[];
};

export type UserRequest = {
  type: "user_request";
  prompt: string;
  uploadedImage: HTMLImageElement;
};

export type AIResponse = {
  type: "ai_response";
  generatedImage: HTMLImageElement;
};

export type Chat = UserRequest | AIResponse;
