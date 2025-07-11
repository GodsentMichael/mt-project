import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/lib/models/Order"
import Product from "@/lib/models/Product"
import Notification from "@/lib/models/Notification"
import { generateOrderNumber } from "@/lib/utils/order-utils"

interface OrderItem {
  productId: string
  quantity: number
  price: number
}

interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

interface OrderData {
  items: OrderItem[]
  shippingAddress: ShippingAddress
  billingAddress?: ShippingAddress
  notes?: string
  paymentMethod: string
}

// Initialize Paystack
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = "https://api.paystack.co"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    await connectDB()

    const body: OrderData = await request.json()
    const { items, shippingAddress, billingAddress, notes, paymentMethod } = body

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      )
    }

    if (!shippingAddress || !shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.address1) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    // Verify products exist and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      })
    }

    // Calculate shipping and tax
    const shipping = subtotal >= 50000 ? 0 : 2500 // Free shipping over ₦50,000
    const tax = subtotal * 0.075 // 7.5% VAT
    const total = subtotal + shipping + tax

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create order
    const order = new Order({
      orderNumber,
      userId: session.user.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod,
      subtotal,
      tax,
      shipping,
      discount: 0,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      items: orderItems,
      notes,
    })

    await order.save()

    // Create Paystack payment if method is paystack
    let paymentUrl = null
    if (paymentMethod === "paystack") {
      try {
        const paystackData = {
          email: session.user.email,
          amount: Math.round(total * 100), // Paystack expects amount in kobo
          reference: `order_${order._id}_${Date.now()}`,
          callback_url: `${process.env.NEXTAUTH_URL}/api/payments/paystack/callback`,
          metadata: {
            orderId: (order._id as any).toString(),
            userId: session.user.id,
            orderNumber: order.orderNumber,
          },
          channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        }

        const paystackResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paystackData),
        })

        const paystackResult = await paystackResponse.json()

        if (paystackResult.status) {
          paymentUrl = paystackResult.data.authorization_url
          
          // Update order with payment reference
          order.paymentId = paystackData.reference
          await order.save()
        } else {
          console.error("Paystack initialization failed:", paystackResult)
          return NextResponse.json(
            { error: "Payment initialization failed" },
            { status: 500 }
          )
        }
      } catch (error) {
        console.error("Paystack error:", error)
        return NextResponse.json(
          { error: "Payment initialization failed" },
          { status: 500 }
        )
      }
    }

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      )
    }

    // Update notifications
    const notification = {
      type: "order",
      message: `New order placed: ${order.orderNumber}`,
      link: `/admin/orders/${order._id}`,
      createdAt: new Date(),
    }

    await Notification.create(notification)

    return NextResponse.json({
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      paymentUrl,
    })

  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const orders = await Order.find({ userId: session.user.id })
      .populate("items.productId", "name images slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalCount = await Order.countDocuments({ userId: session.user.id })
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })

  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
