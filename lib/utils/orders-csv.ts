import type { ShopOrder, OrderStatus } from "@/lib/types/order"

const statusLabels: Record<OrderStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  dispatched: "Dispatched",
  rejected: "Rejected",
}

function escapeCsv(value: string | number | boolean) {
  const text = String(value ?? "")
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function ordersToCsv(orders: ShopOrder[]): string {
  const headers = [
    "Order Number",
    "Date",
    "Phone",
    "Address",
    "Status",
    "Items",
    "Subtotal (PKR)",
    "Shipping (PKR)",
    "Total (PKR)",
    "Free Shipping",
  ]

  const rows = orders.map((order) => {
    const items = order.items
      .map((item) => `${item.name} x${item.quantity} @ PKR ${item.price}`)
      .join("; ")

    return [
      order.orderNumber,
      new Date(order.createdAt).toISOString(),
      order.customerPhone,
      order.customerAddress,
      statusLabels[order.status],
      items,
      order.subtotal,
      order.freeShipping ? 0 : order.shipping,
      order.total,
      order.freeShipping ? "Yes" : "No",
    ].map(escapeCsv)
  })

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

export function downloadOrdersCsv(orders: ShopOrder[], filenamePrefix = "thebazm-orders") {
  const csv = ordersToCsv(orders)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function countOrdersByStatus(orders: ShopOrder[]) {
  return orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1
      return acc
    },
    {} as Record<OrderStatus, number>,
  )
}
