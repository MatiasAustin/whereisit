import { NextResponse } from 'next/server';
import { getCharacterInquiries, createCharacterInquiry, updateCharacterInquiryStatus } from '@/lib/storage';

export async function GET() {
  try {
    const inquiries = await getCharacterInquiries();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch character inquiries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.clientName || !body.email || !body.referenceNotes) {
      return NextResponse.json({ success: false, error: 'Name, email, and reference notes are required' }, { status: 400 });
    }

    const newInquiry = await createCharacterInquiry({
      clientName: body.clientName,
      email: body.email,
      phone: body.phone || '',
      characterType: body.characterType || 'Self / Portrait',
      style: body.style || 'Chibi Petite',
      plaqueText: body.plaqueText || '',
      photoUrl: body.photoUrl || '',
      referenceNotes: body.referenceNotes,
    });

    return NextResponse.json({ success: true, data: newInquiry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit character inquiry' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }

    const success = await updateCharacterInquiryStatus(id, status);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
