import { NextResponse } from 'next/server';
import { getJournalArticles, updateJournalArticle, createJournalArticle, deleteJournalArticle } from '@/lib/storage';

export async function GET() {
  try {
    const articles = await getJournalArticles();
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch journal articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.excerpt) {
      return NextResponse.json({ success: false, error: 'Title and excerpt are required' }, { status: 400 });
    }
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newArticle = await createJournalArticle({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      content: body.content || '',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      author: body.author || 'WhereIsIt Studio',
      status: body.status || 'PUBLISHED',
    });
    return NextResponse.json({ success: true, data: newArticle });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create article' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const updated = await updateJournalArticle(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Article ID is required' }, { status: 400 });
    }
    const deleted = await deleteJournalArticle(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete article' }, { status: 500 });
  }
}
