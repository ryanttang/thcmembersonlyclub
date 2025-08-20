import { format } from "date-fns";

export function fmtDate(d: Date) {
  return format(d, "EEE, MMM d, yyyy");
}

export function requireAdmin(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  const header = request.headers.get("x-admin-token") || "";
  if (!token || header !== token) {
    return new Response("Unauthorized", { status: 401 });
  }
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
