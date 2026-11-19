const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function encodeBase58(bytes) {
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) + BigInt(byte);
  let encoded = "";
  while (value > 0n) {
    const remainder = Number(value % 58n);
    value /= 58n;
    encoded = BASE58[remainder] + encoded;
  }
  return "1".repeat(zeros) + encoded;
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
    if (url.pathname === "/health") return json({ ok: true, service: "O-TV-Source" });

    const match = url.pathname.match(/^\/s\/([A-Za-z0-9_-]{24,128})\/?$/);
    if (!match || !env.SUBSCRIPTION_TOKEN || !safeEqual(match[1], env.SUBSCRIPTION_TOKEN)) {
      return new Response("Not Found", { status: 404, headers: { "cache-control": "no-store" } });
    }
    if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
      return json({ error: "service_not_configured" }, 503);
    }

    const branch = env.GITHUB_BRANCH || "main";
    const path = env.CONFIG_PATH || "config/subscription.json";
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`;
    const upstream = await fetch(apiUrl, {
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: "application/vnd.github.raw+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "O-TV-Source-Worker"
      }
    });
    if (!upstream.ok) return json({ error: "source_unavailable", status: upstream.status }, 502);

    const raw = await upstream.text();
    let config;
    try {
      config = JSON.parse(raw);
      if (!config || typeof config !== "object" || !config.api_site || typeof config.api_site !== "object") {
        throw new Error("invalid config shape");
      }
    } catch {
      return json({ error: "invalid_subscription_config" }, 500);
    }

    const encoded = encodeBase58(new TextEncoder().encode(JSON.stringify(config)));
    return new Response(encoded, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        "x-content-type-options": "nosniff"
      }
    });
  }
};
