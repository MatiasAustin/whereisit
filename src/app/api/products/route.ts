import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let products = await getProducts();

    if (category && category !== 'All') {
      products = products.filter((p) => p.category === category);
    }

    if (status) {
      products = products.filter((p) => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.materials.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: 'Name and price are required' }, { status: 400 });
    }

    const newProduct = await createProduct({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: body.category || 'Desk Objects',
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      badge: body.badge || undefined,
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      materials: body.materials || 'Matte structural bio-polymer',
      dimensions: body.dimensions || 'Custom dimension',
      weight: body.weight || '350g',
      layerResolution: body.layerResolution || '0.12mm Precision Profile',
      colorOptions: body.colorOptions && body.colorOptions.length ? body.colorOptions : ['Slate Blue', 'Bone Alabaster'],
      images: body.images && body.images.length ? body.images : ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'],
      featured: Boolean(body.featured),
      stock: body.stock !== undefined ? Number(body.stock) : 10,
      status: body.status || 'ACTIVE',
      rating: body.rating ? Number(body.rating) : 5.0,
      tags: body.tags || ['bespoke', '3d-printed'],
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
