import { NextResponse } from 'next/server';
import { getJournalArticles, updateJournalArticle } from '@/lib/storage';

export async function GET() {
  try {
    const articles = getJournalArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch journal articles' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const updated = updateJournalArticle(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update article' }, { status: 500 });
  }
}
