import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    const { slug } = params;
    let product = await Product.findOne({ originalId: slug });
    if (!product) {
      if (/^[0-9a-fA-F]{24}$/.test(slug)) {
        product = await Product.findById(slug);
      }
    }
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('ERROR FETCHING SINGLE PRODUCT -', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
