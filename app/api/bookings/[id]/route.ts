import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// Type definitions
interface BookingUpdateBody {
  status?: 'pending' | 'confirmed' | 'cancelled';
}

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;

// Helper function to validate authentication and authorization
async function validateAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return {
      isValid: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  return { isValid: true, session };
}

// Helper function to validate and sanitize booking ID
function validateBookingId(id: string | null): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    return { isValid: false, error: 'Invalid booking ID' };
  }
  return { isValid: true };
}

// Helper function to check user authorization for booking
async function authorizeBookingAccess(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, userId: true },
  });

  if (!booking) {
    return { isAuthorized: false, error: 'Booking not found' };
  }

  if (booking.userId !== userId) {
    return { isAuthorized: false, error: 'Forbidden' };
  }

  return { isAuthorized: true };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return authResult.response;
    }

    const { id } = params;
    const userId = authResult.session.user.id;

    // Validate booking ID format
    const idValidation = validateBookingId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    // Validate request body
    let body: BookingUpdateBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { status } = body;

    // Validate status is provided
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check authorization
    const authCheck = await authorizeBookingAccess(id, userId);
    if (!authCheck.isAuthorized) {
      const statusCode = authCheck.error === 'Forbidden' ? 403 : 404;
      return NextResponse.json(
        { error: authCheck.error },
        { status: statusCode }
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(booking);
  } catch (error: unknown) {
    const prismaError = error as any;
    
    if (prismaError?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[API] Error updating booking ${params.id}:`,
      errorMessage
    );

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const authResult = await validateAuth(request);
    if (!authResult.isValid) {
      return authResult.response;
    }

    const { id } = params;
    const userId = authResult.session.user.id;

    // Validate booking ID format
    const idValidation = validateBookingId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    // Check authorization
    const authCheck = await authorizeBookingAccess(id, userId);
    if (!authCheck.isAuthorized) {
      const statusCode = authCheck.error === 'Forbidden' ? 403 : 404;
      return NextResponse.json(
        { error: authCheck.error },
        { status: statusCode }
      );
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const prismaError = error as any;
    
    if (prismaError?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[API] Error deleting booking ${params.id}:`,
      errorMessage
    );

    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
