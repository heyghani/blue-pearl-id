export function verifyCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const authorization = request.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}
