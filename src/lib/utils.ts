import { format } from "date-fns";

export function fmtDate(d: Date) {
  return format(d, "EEE, MMM d, yyyy");
}

export function requireAdmin(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  const header = request.headers.get("x-admin-token") || "";
  
  console.log("requireAdmin check:"); // Debug log
  console.log("  - Expected token:", token); // Debug log
  console.log("  - Received header:", header); // Debug log
  console.log("  - Tokens match:", token === header); // Debug log
  
  if (!token || header !== token) {
    console.log("  - Access DENIED"); // Debug log
    return new Response("Unauthorized", { status: 401 });
  }
  
  console.log("  - Access GRANTED"); // Debug log
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}
