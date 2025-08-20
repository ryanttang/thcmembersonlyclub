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

const UpdateEventSchema = EventSchema.partial();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const admin = url.searchParams.get("admin");
  
  console.log("GET /api/events - admin param:", admin); // Debug log
  
  // If admin parameter is present, check admin token and return all events
  if (admin) {
    console.log("Admin request detected, checking token..."); // Debug log
    const unauthorized = requireAdmin(req);
    if (unauthorized) {
      console.log("Unauthorized access attempt"); // Debug log
      return unauthorized;
    }
    
    console.log("Admin token valid, fetching events..."); // Debug log
    const events = await prisma.event.findMany({
      orderBy: [{ date: "asc" }, { createdAt: "desc" }],
    });
    console.log("Found events:", events.length); // Debug log
    return Response.json(events);
  }
  
  // Public endpoint - only published events
  console.log("Public request, fetching published events..."); // Debug log
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

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return new Response("Event ID required", { status: 400 });
  }

  const body = await req.json();
  const parsed = UpdateEventSchema.safeParse(body);
  if (!parsed.success) return new Response("Bad request", { status: 400 });

  const updateData: any = { ...parsed.data };
  if (updateData.date && typeof updateData.date === 'string') {
    updateData.date = new Date(`${updateData.date}T00:00:00Z`);
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });
    return Response.json(event);
  } catch (error) {
    return new Response("Event not found", { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return new Response("Event ID required", { status: 400 });
  }

  try {
    await prisma.event.delete({
      where: { id },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response("Event not found", { status: 404 });
  }
}
