import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const existing = await prisma.booking.findFirst({
    where: { date: new Date(body.date) }
  });

  if (existing) {
    return Response.json({ error: "Already booked" }, { status: 400 });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: body.userId,
      propertyId: body.propertyId,
      date: new Date(body.date),
      golfers: body.golfers,
      status: "HOLD",
      totalPrice: body.price,
      upsells: {}
    }
  });

  return Response.json(booking);
}
