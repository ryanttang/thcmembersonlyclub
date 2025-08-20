import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { requireAdmin, slugify } from "@/lib/utils";

const EventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  date: z.string().min(1), // yyyy-mm-dd
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  location: z.string().min(1),
  ticketUrl: z.string().url(),
  flyerUrl: z.string().url(),
  isPublished: z.boolean().optional().default(true),
});

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: [{ date: "asc" }, { createdAt: "desc" }],
  });
  return Response.json(events);
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return new Response("Bad request", { status: 400 });

  const { title, date, ...rest } = parsed.data;
  const slugBase = slugify(`${title}-${date}`);

  const event = await prisma.event.create({
    data: {
      title,
      date: new Date(`${date}T00:00:00Z`),
      slug: slugBase,
      ...rest,
    },
  });
  return Response.json(event, { status: 201 });
}
