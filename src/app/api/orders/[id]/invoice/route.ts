import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/db"
import Order from "@/lib/models/Order"
import User from "@/lib/models/User"
import Product from "@/lib/models/Product"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    // Find the order and populate necessary fields
    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price images')
      .lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user owns this order or is admin
    if (order.userId._id.toString() !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order)

    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.html"`
      }
    })
  } catch (error) {
    console.error("Error generating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateInvoiceHTML(order: any) {
  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
  const shipping = 2500 // ₦2,500 shipping
  const tax = subtotal * 0.075 // 7.5% VAT
  const total = subtotal + shipping + tax

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${order.orderNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 5px;
            }
            .invoice-title {
                font-size: 24px;
                margin: 20px 0;
            }
            .invoice-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .invoice-details, .customer-details {
                flex: 1;
            }
            .customer-details {
                text-align: right;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            th {
                background-color: #f8f9fa;
                font-weight: bold;
            }
            .text-right {
                text-align: right;
            }
            .summary-table {
                width: 300px;
                margin-left: auto;
                margin-top: 20px;
            }
            .summary-table td {
                border: none;
                padding: 8px 12px;
            }
            .total-row {
                font-weight: bold;
                font-size: 18px;
                border-top: 2px solid #007bff;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            .status-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                color: white;
            }
            .status-delivered { background-color: #28a745; }
            .status-pending { background-color: #ffc107; color: #000; }
            .status-processing { background-color: #007bff; }
            .status-shipped { background-color: #6f42c1; }
            .status-cancelled { background-color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">McTaylor Shop</div>
            <div>Premium Fashion Store</div>
        </div>

        <h1 class="invoice-title">INVOICE</h1>

        <div class="invoice-info">
            <div class="invoice-details">
                <strong>Invoice Number:</strong> ${order.orderNumber}<br>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                <strong>Status:</strong> 
                <span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="customer-details">
                <strong>Bill To:</strong><br>
                ${order.userId.name}<br>
                ${order.userId.email}<br>
                ${order.shippingAddress ? `
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
                    ${order.shippingAddress.zipCode}<br>
                    ${order.shippingAddress.country}
                ` : ''}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map((item: any) => `
                    <tr>
                        <td>${item.productId.name}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">₦${item.price.toLocaleString()}</td>
                        <td class="text-right">₦${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <table class="summary-table">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">₦${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Shipping:</td>
                <td class="text-right">₦${shipping.toLocaleString()}</td>
            </tr>
            <tr>
                <td>Tax (7.5%):</td>
                <td class="text-right">₦${tax.toLocaleString()}</td>
            </tr>
            <tr class="total-row">
                <td>Total:</td>
                <td class="text-right">₦${total.toLocaleString()}</td>
            </tr>
        </table>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>For any questions about this invoice, please contact us at support@mctaylor.com</p>
        </div>
    </body>
    </html>
  `
}
