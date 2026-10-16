export async function onRequest(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'Ankitti Cloudflare Edge API',
      time: Date.now(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
