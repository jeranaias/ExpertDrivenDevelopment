// Ask EDD worker. Proxies browser chat requests from the EDD GitHub Pages
// site to the smart-router behind a Tailscale Funnel. Keeps the bearer key
// server-side. Streams SSE through without buffering.

const UPSTREAM_URL = 'https://sn4622129582.tail5bcfa2.ts.net:8443/v1/chat/completions';
const UPSTREAM_HEALTH = 'https://sn4622129582.tail5bcfa2.ts.net:8443/health';

const ALLOWED_ORIGINS = new Set([
  'https://jeranaias.github.io',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
]);

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://jeranaias.github.io';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function jsonError(status, message, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      try {
        const r = await fetch(UPSTREAM_HEALTH, { cf: { cacheTtl: 0 } });
        return new Response(await r.text(), {
          status: r.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        });
      } catch (e) {
        return jsonError(502, 'upstream unreachable', origin);
      }
    }

    if (url.pathname !== '/chat' || request.method !== 'POST') {
      return jsonError(404, 'not found', origin);
    }

    if (!env.RIGRUN_KEY) {
      return jsonError(500, 'worker missing RIGRUN_KEY secret', origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, 'body must be JSON', origin);
    }

    const sessionId = request.headers.get('X-Session-ID') || crypto.randomUUID();

    // Clamp client-supplied params so widget callers cannot run up cost.
    const payload = {
      model: body.model || 'local',
      messages: Array.isArray(body.messages) ? body.messages.slice(-20) : [],
      stream: body.stream !== false,
      max_tokens: Math.min(Number(body.max_tokens) || 1024, 2048),
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.7,
    };

    let upstream;
    try {
      upstream = await fetch(UPSTREAM_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RIGRUN_KEY}`,
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return jsonError(502, 'upstream unreachable', origin);
    }

    const responseHeaders = {
      ...corsHeaders(origin),
      'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Session-ID': sessionId,
    };

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};
