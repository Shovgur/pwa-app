/**
 * Cloudflare Worker:
 * 1) Прокси Bot API:  /bot<token>/<method>  (+ header X-Telegram-Proxy-Secret)
 * 2) Приём webhook:   POST /telegram-webhook  → форвард на bookingo.ru
 *    (Telegram не достучится до VPS напрямую)
 *
 * CF Variables:
 *   PROXY_SECRET = TELEGRAM_WEBHOOK_SECRET с VPS
 *   FORWARD_WEBHOOK_URL = https://bookingo.ru/api/telegram/webhook  (опционально)
 */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, X-Telegram-Proxy-Secret, X-Telegram-Bot-Api-Secret-Token',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
      });
    }

    const url = new URL(request.url);

    // ── Telegram → Worker → VPS ─────────────────────────────────────────────
    if (url.pathname === '/telegram-webhook' || url.pathname === '/webhook') {
      const forwardTo = env.FORWARD_WEBHOOK_URL || 'https://bookingo.ru/api/telegram/webhook';
      const headers = {
        'Content-Type': 'application/json',
      };
      const tgSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (tgSecret) headers['X-Telegram-Bot-Api-Secret-Token'] = tgSecret;

      const body = await request.arrayBuffer();
      try {
        const upstream = await fetch(forwardTo, {
          method: 'POST',
          headers,
          body,
        });
        const buf = await upstream.arrayBuffer();
        return new Response(buf, {
          status: upstream.status,
          headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'application/json' },
        });
      } catch (err) {
        return Response.json({ ok: false, description: String(err && err.message || err) }, { status: 502 });
      }
    }

    // ── VPS → Worker → api.telegram.org ─────────────────────────────────────
    const expected = env.PROXY_SECRET || '';
    if (expected) {
      const got = request.headers.get('X-Telegram-Proxy-Secret') || '';
      if (got !== expected) {
        return Response.json({ ok: false, description: 'Unauthorized proxy' }, { status: 401 });
      }
    }

    if (!url.pathname.startsWith('/bot')) {
      return Response.json({
        ok: false,
        description: 'Paths: /bot<token>/<method> or POST /telegram-webhook',
      }, { status: 400 });
    }

    const target = 'https://api.telegram.org' + url.pathname + url.search;
    const init = {
      method: request.method,
      headers: { 'Content-Type': request.headers.get('Content-Type') || 'application/json' },
    };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.arrayBuffer();
    }

    const upstream = await fetch(target, init);
    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
