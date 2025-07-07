import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/lib/models/Product'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    
    const { slug } = await context.params
    
    // Find product by slug and populate category
    const product = await Product.findOne({ 
      slug, 
      status: 'ACTIVE' 
    }).populate('categoryId', 'name slug').lean()
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Convert ObjectId to string for serialization
    if (Array.isArray(product)) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const serializedProduct = {
      ...product,
      _id: product._id?.toString(),
      categoryId: product.categoryId ? {
        _id: product.categoryId._id?.toString(),
        name: product.categoryId.name,
        slug: product.categoryId.slug
      } : null
    }
    
    return NextResponse.json(serializedProduct)
    
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
