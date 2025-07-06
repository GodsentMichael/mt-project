import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Order from "@/lib/models/Order"
import crypto from "crypto"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = "https://api.paystack.co"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")
    
    if (!reference) {
      return NextResponse.redirect(new URL("/checkout?error=invalid_reference", request.url))
    }

    await connectDB()

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const verifyResult = await verifyResponse.json()

    if (!verifyResult.status) {
      console.error("Payment verification failed:", verifyResult)
      return NextResponse.redirect(new URL("/checkout?error=verification_failed", request.url))
    }

    const { data } = verifyResult
    const orderId = data.metadata?.orderId

    if (!orderId) {
      console.error("Order ID not found in payment metadata")
      return NextResponse.redirect(new URL("/checkout?error=order_not_found", request.url))
    }

    // Update order status
    const order = await Order.findById(orderId)
    if (!order) {
      console.error("Order not found:", orderId)
      return NextResponse.redirect(new URL("/checkout?error=order_not_found", request.url))
    }

    if (data.status === "success") {
      order.paymentStatus = "PAID"
      order.status = "PROCESSING"
      order.paymentId = reference
      await order.save()

      return NextResponse.redirect(new URL(`/orders/${orderId}?success=true`, request.url))
    } else {
      order.paymentStatus = "FAILED"
      await order.save()
      
      return NextResponse.redirect(new URL("/checkout?error=payment_failed", request.url))
    }

  } catch (error) {
    console.error("Payment callback error:", error)
    return NextResponse.redirect(new URL("/checkout?error=callback_error", request.url))
  }
}

// Handle Paystack webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature provided" }, { status: 400 })
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex")

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    await connectDB()

    if (event.event === "charge.success") {
      const { data } = event
      const orderId = data.metadata?.orderId

      if (orderId) {
        const order = await Order.findById(orderId)
        if (order && order.paymentStatus !== "PAID") {
          order.paymentStatus = "PAID"
          order.status = "PROCESSING"
          order.paymentId = data.reference
          await order.save()
        }
      }
    }

    return NextResponse.json({ status: "success" })

  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
