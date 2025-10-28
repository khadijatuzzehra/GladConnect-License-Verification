import { getJson } from "serpapi";

export interface SerAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}
export async function serpImmersiveProductAPI(
  productToken: string
): Promise<SerAPIResponse> {
  return new Promise((resolve) => {
    getJson(
      {
        engine: "google_immersive_product",
        page_token: productToken,
        api_key: process.env.SERPAPI_API_KEY,
      },
      (json) => {
        resolve({ success: true, data: json });
      },
      (error) => {
        resolve({
          success: false,
          error: error.message || "Unknown error occurred",
        });
      }
    );
  });
}
