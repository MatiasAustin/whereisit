import { NextResponse } from 'next/server';
import { getDesignInquiries, createDesignInquiry, updateDesignInquiryStatus } from '@/lib/storage';

export async function GET() {
  try {
    const inquiries = await getDesignInquiries();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.clientName || !body.email || !body.description) {
      return NextResponse.json({ success: false, error: 'Name, email, and description are required' }, { status: 400 });
    }

    const newInquiry = await createDesignInquiry({
      clientName: body.clientName,
      email: body.email,
      phone: body.phone || '',
      projectType: body.projectType || 'Desk Object',
      dimensionConstraints: body.dimensionConstraints || '',
      estimatedBudget: body.estimatedBudget || '',
      description: body.description,
      desiredTimeline: body.desiredTimeline || '',
    });

    return NextResponse.json({ success: true, data: newInquiry }, { status: 201 });
  } catch (error: any) {
    console.error('Error in design inquiry POST:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to submit design inquiry' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const success = await updateDesignInquiryStatus(id, status);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
