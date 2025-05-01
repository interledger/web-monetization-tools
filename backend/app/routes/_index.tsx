import { json, type LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = () => {
  return json({
    status: "ok",
    message: "Web Monetization API Server",
    endpoints: [
      { 
        path: "/api/config/:type", 
        methods: ["GET", "POST", "PUT", "DELETE"],
        description: "Manage monetization configuration"
      }
    ],
    timestamp: new Date().toISOString()
  }, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
};