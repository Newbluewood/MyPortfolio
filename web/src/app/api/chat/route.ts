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

  const baseRaw = serverEnv().PORTFOLIO_API_URL.replace(/\/$/, "");
  let backendHost: string;
  try {
    backendHost = new URL(baseRaw).hostname;
  } catch {
    return new Response(
      JSON.stringify({
        error:
          "PORTFOLIO_API_URL is invalid. Set it in Vercel → Environment Variables to your Railway API URL (https://…).",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
  if (
    process.env.VERCEL &&
    (backendHost === "localhost" ||
      backendHost === "127.0.0.1" ||
      backendHost === "::1")
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Chat proxy misconfigured: PORTFOLIO_API_URL still points to localhost. In Vercel → Settings → Environment Variables set PORTFOLIO_API_URL to your public Railway API URL (no trailing slash), then redeploy.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const base = baseRaw;
  let backend: Response;
  try {
    backend = await fetch(`${base}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return new Response(
      JSON.stringify({
        error: `Could not reach portfolio API (${detail}). On Vercel set PORTFOLIO_API_URL to your Railway public https URL (no trailing /), redeploy. Open that URL + /health in a browser to confirm the API is up.`,
      }),
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
