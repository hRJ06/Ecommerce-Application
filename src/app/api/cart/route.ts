import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/cart';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const cart = await Cart.findOne({ user: auth.userId });
    
    if (!cart) {
      console.log('NO CART FOUND FOR USER - ', auth.userId);
      return NextResponse.json({ items: [], total: 0 });
    }

    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findOne({ originalId: item.product });
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          product: product ? {
            _id: product._id,
            originalId: product.originalId,
            title: product.title,
            price: product.price,
            image: product.image
          } : null
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems
    };
    
    console.log('CART FOUND - ', populatedCart);
    return NextResponse.json(populatedCart);
  } catch (error: any) {
    console.error('CART ERROR - ', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const body = await request.json();
    const { productId, quantity, price } = body;

    console.log('ADDING TO CART - ', { productId, quantity, price });

    const product = await Product.findOne({ originalId: productId });
    if (!product) {
      console.log('PRODUCT NOT FOUND - ', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('FOUND PRODUCT - ', product);

    let cart = await Cart.findOne({ user: auth.userId });
    if (!cart) {
      console.log('CREATING NEW CART FOR USER - ', auth.userId);
      cart = new Cart({
        user: auth.userId,
        items: [],
        total: 0
      });
    }

    const cartItem = {
      product: product.originalId,
      quantity,
      price
    };

    console.log('CART ITEM - ', cartItem);

    const existingItemIndex = cart.items.findIndex(
      item => item.product === product.originalId
    );

    if (existingItemIndex > -1) {
      console.log('UPDATING EXISTING ITEM AT INDEX - ', existingItemIndex);
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      console.log('ADDING NEW ITEM TO CART');
      cart.items.push(cartItem);
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log('CART BEFORE SAVE - ', cart);

    await cart.save();

    console.log('CART SAVED SUCCESSFULLY');

    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findOne({ originalId: item.product });
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          product: product ? {
            _id: product._id,
            originalId: product.originalId,
            title: product.title,
            price: product.price,
            image: product.image
          } : null
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems
    };

    console.log('POPULATED CART - ', populatedCart);

    return NextResponse.json(populatedCart);
  } catch (error: any) {
    console.error('CART ERROR - ', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    console.log('CLEARING CART FOR USER - ', auth.userId);
    await Cart.findOneAndDelete({ user: auth.userId });
    
    console.log('CART CLEARED SUCCESSFULLY');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('CART ERROR - ', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
