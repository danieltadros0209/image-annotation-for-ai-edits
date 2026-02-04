import { apiClient } from "./client";

export const generateImage = (payload: FormData, ...options) => {
  return apiClient.post("/generate", payload, ...options);
};
