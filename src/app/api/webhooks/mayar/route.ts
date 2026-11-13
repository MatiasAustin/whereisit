import { NextResponse } from 'next/server';
import { POST as handleDynamicWebhook } from './[token]/route';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') || request.headers.get('x-mayar-token') || '';
  return handleDynamicWebhook(request, { params: Promise.resolve({ token }) });
}
