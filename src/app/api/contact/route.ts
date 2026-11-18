import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Nama, email, dan pesan wajib diisi' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let contacts: any[] = [];
    if (fs.existsSync(CONTACTS_FILE)) {
      try {
        const fileContent = fs.readFileSync(CONTACTS_FILE, 'utf-8');
        contacts = JSON.parse(fileContent);
      } catch {
        contacts = [];
      }
    }

    const newContact = {
      id: `contact-${Date.now()}`,
      name,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      createdAt: new Date().toISOString(),
      status: 'UNREAD',
    };

    contacts.unshift(newContact);
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: newContact });
  } catch (error) {
    console.error('Failed to submit contact message:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengirim pesan, silakan coba lagi' },
      { status: 500 }
    );
  }
}
