export function isAuthorizedCronRequest(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  return authHeader === expected;
}
