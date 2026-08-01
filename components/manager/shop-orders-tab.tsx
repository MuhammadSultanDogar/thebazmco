"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Truck, Check, X, Loader2 } from "lucide-react"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import { formatPrice } from "@/lib/constants/payment"

const statusColors: Record<OrderStatus, string> = {
  pending_review: "bg-orange-100 text-orange-700",
  approved: "bg-blue-100 text-blue-700",
  dispatched: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

const statusLabels: Record<OrderStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  dispatched: "Dispatched",
  rejected: "Rejected",
}

export function ShopOrdersTab() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [viewing, setViewing] = useState<ShopOrder | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders?all=true")
      if (res.ok) setOrders(await res.json())
    } catch {
      console.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (order: ShopOrder, status: OrderStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status }),
      })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map((o) => (o.id === order.id ? updated : o)))
        if (viewing?.id === order.id) setViewing(updated)
      }
    } catch {
      console.error("Failed to update order")
    }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== id))
        if (viewing?.id === id) setViewing(null)
      }
    } catch {
      console.error("Failed to delete order")
    }
  }

  if (viewing) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setViewing(null)}>
          ← Back to Orders
        </Button>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold">{viewing.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">
                {new Date(viewing.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[viewing.status]}`}>
              {statusLabels[viewing.status]}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{viewing.customerPhone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{viewing.customerAddress}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Items</p>
            <ul className="text-sm space-y-1">
              {viewing.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span>PKR {item.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm space-y-1 pt-2 border-t">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>PKR {formatPrice(viewing.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{viewing.freeShipping ? "FREE" : `PKR ${formatPrice(viewing.shipping)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">PKR {formatPrice(viewing.total)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Payment Screenshot</p>
            <img
              src={viewing.paymentImage}
              alt="Payment proof"
              className="max-w-full max-h-96 rounded-xl border border-border object-contain bg-secondary"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {viewing.status === "pending_review" && (
              <>
                <Button onClick={() => updateStatus(viewing, "approved")} className="gap-2">
                  <Check className="w-4 h-4" /> Approve Payment
                </Button>
                <Button variant="outline" onClick={() => updateStatus(viewing, "rejected")} className="gap-2 text-red-600">
                  <X className="w-4 h-4" /> Reject
                </Button>
              </>
            )}
            {viewing.status === "approved" && (
              <Button onClick={() => updateStatus(viewing, "dispatched")} className="gap-2">
                <Truck className="w-4 h-4" /> Mark Dispatched
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Shop Orders ({orders.length})</h2>
          <Button size="sm" variant="outline" onClick={fetchOrders}>Refresh</Button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No shop orders yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/50">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  <p className="text-xs text-muted-foreground">
                    PKR {formatPrice(order.total)} · {order.items.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => setViewing(order)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
