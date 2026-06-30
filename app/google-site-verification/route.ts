export function GET() {
  return new Response("google-site-verification: google854c868d465b316a.html", {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
