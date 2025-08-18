import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';

const categoryMap: { [key: string]: string } = {
  electronics: 'gadgets',
  gadgets: 'gadgets',
  medicine: 'medicine',
  grocery: 'grocery',
  clothing: 'clothing',
  furniture: 'furniture',
  books: 'books',
  beauty: 'makeup',
  makeup: 'makeup',
  bags: 'bags',
  snacks: 'grocery',
  bakery: 'bakery'
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    console.log('CONNECTED TO MONGODB');
    
    const { searchParams } = new URL(request.url);
    const requestedCategory = searchParams.get('category') || 'electronics';
    const category = categoryMap[requestedCategory] || requestedCategory;
    console.log('REQUESTED CATEGORY - ', requestedCategory, '-> MAPPED TO - ', category);
    
    const query: any = {};
    if (category !== 'all') {
      query.shop_category = category;
    }
    console.log('QUERY:', JSON.stringify(query));
    
    const count = await Product.countDocuments(query);
    console.log('MATCHING PRODUCTS COUNT - ', count);

    const products = await Product.aggregate([
      { $match: query },
      {
        $addFields: {
          score: {
            $multiply: [
              { $ifNull: ['$rating', 0] },
              { $add: [{ $ifNull: ['$sales', 0] }, 1] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 8 }
    ]);
    
    console.log('FOUND FEATURED PRODUCTS - ', products.length);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('FEATURED PRODUCTS ERROR -', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
