"use client"

import type { ShopOrder } from "@/lib/types/order"

export async function downloadOrderInvoicePdf(
  order: Pick<ShopOrder, "id" | "orderNumber" | "invoiceToken">,
): Promise<void> {
  const res = await fetch("/api/order-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      token: order.invoiceToken,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Failed to generate invoice PDF")
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Order-${order.orderNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function printOrderInvoice(element: HTMLElement, orderNumber: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Order Invoice - ${orderNumber}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
