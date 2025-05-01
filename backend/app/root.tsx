import { type LinksFunction, json } from "@remix-run/cloudflare";

export const links: LinksFunction = () => {
  return [];
};

export function ErrorBoundary() {
  return json(
    {
      status: "error",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString()
    },
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  );
}