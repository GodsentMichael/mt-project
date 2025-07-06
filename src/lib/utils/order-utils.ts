import Order from "@/lib/models/Order"

export async function generateOrderNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  
  // Find the latest order for today
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  
  const latestOrder = await Order.findOne({
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay
    }
  }).sort({ createdAt: -1 })
  
  let sequence = 1
  if (latestOrder && latestOrder.orderNumber) {
    const lastSequence = parseInt(latestOrder.orderNumber.slice(-3))
    sequence = lastSequence + 1
  }
  
  return `MCT${year}${month}${day}${sequence.toString().padStart(3, '0')}`
}

export function calculateOrderTotals(items: Array<{ price: number; quantity: number }>) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal >= 50000 ? 0 : 2500 // Free shipping over ₦50,000
  const tax = subtotal * 0.075 // 7.5% VAT
  const total = subtotal + shipping + tax
  
  return {
    subtotal,
    shipping,
    tax,
    total
  }
}

export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped", 
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded"
  }
  
  return statusMap[status] || status
}

export function formatPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded"
  }
  
  return statusMap[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800", 
    SHIPPED: "bg-purple-100 text-purple-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-gray-100 text-gray-800"
  }
  
  return colorMap[status] || "bg-gray-100 text-gray-800"
}

export function getPaymentStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800", 
    REFUNDED: "bg-gray-100 text-gray-800"
  }
  
  return colorMap[status] || "bg-gray-100 text-gray-800"
}
