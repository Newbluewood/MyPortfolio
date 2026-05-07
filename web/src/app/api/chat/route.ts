import { serverEnv } from "@/lib/env/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const message =
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message
      : null;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const base = serverEnv().PORTFOLIO_API_URL.replace(/\/$/, "");
  let backend: Response;
  try {
    backend = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Could not reach portfolio API" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!backend.ok || !backend.body) {
    const text = await backend.text();
    return new Response(text || backend.statusText, { status: backend.status });
  }

  return new Response(backend.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
