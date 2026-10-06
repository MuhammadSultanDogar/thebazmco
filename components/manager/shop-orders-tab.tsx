"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Trash2, Truck, Check, X, Loader2, Download, Mail, Save, Printer, FileText } from "lucide-react"
import type { ShopOrder, OrderStatus } from "@/lib/types/order"
import type { OrderNotificationSettings } from "@/lib/types/order-notifications"
import { DEFAULT_ORDER_NOTIFICATIONS } from "@/lib/types/order-notifications"
import { formatPrice } from "@/lib/constants/payment"
import { downloadOrdersCsv } from "@/lib/utils/orders-csv"
import type { ShopOrderSummary } from "@/lib/utils/order-summary"
import { requestOrderAlertPermission } from "@/components/manager/order-alert-poller"
import { ShopOrderInvoiceTemplate } from "@/components/shop-order-invoice-template"
import { downloadOrderInvoicePdf, printOrderInvoice } from "@/lib/utils/download-order-invoice"

const statusColors: Record<OrderStatus, string> = {
  pending_review: "bg-orange-100 text-orange-700",
  approved: "bg-blue-100 text-blue-700",
  dispatched: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

const statusLabels: Record<OrderStatus, string> = {
  pending_review: "Pending",
  approved: "Approved",
  dispatched: "Dispatched",
  rejected: "Rejected",
}

type StatusFilter = "all" | OrderStatus

const filterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "dispatched", label: "Dispatched" },
  { value: "rejected", label: "Rejected" },
]

const PAGE_SIZE = 20

type OrdersListResponse = {
  orders: ShopOrderSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
  statusCounts: Record<OrderStatus, number>
}

export function ShopOrdersTab() {
  const [orders, setOrders] = useState<ShopOrderSummary[]>([])
  const [viewing, setViewing] = useState<ShopOrder | null>(null)
  const [loadingView, setLoadingView] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState<Record<OrderStatus, number>>({
    pending_review: 0,
    approved: 0,
    dispatched: 0,
    rejected: 0,
  })
  const [fetchError, setFetchError] = useState("")
  const [notifications, setNotifications] = useState<OrderNotificationSettings>(
    DEFAULT_ORDER_NOTIFICATIONS,
  )
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationError, setNotificationError] = useState("")
  const [showInvoice, setShowInvoice] = useState(false)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notification-settings", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.orderNotifications) setNotifications(data.orderNotifications)
      }
    } catch {
      /* optional settings */
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    setNotificationMessage("")
    setNotificationError("")
    try {
      const res = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNotifications: notifications }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNotificationError(data.error || "Failed to save email settings")
        return
      }
      setNotifications(data.orderNotifications)
      setNotificationMessage("Email notification settings saved.")
    } catch {
      setNotificationError("Failed to save email settings")
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const fetchOrders = async (pageToLoad = page) => {
    setLoading(true)
    setFetchError("")
    try {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: String(PAGE_SIZE),
      })
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/orders?${params}`, { cache: "no-store" })
      if (!res.ok) {
        setFetchError("Could not load orders. Make sure you are logged in.")
        return
      }
      const data: OrdersListResponse = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
      setStatusCounts(data.statusCounts)
    } catch {
      setFetchError("Failed to fetch orders.")
    } finally {
      setLoading(false)
    }
  }

  const openOrder = async (summary: ShopOrderSummary) => {
    setLoadingView(true)
    setFetchError("")
    try {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(summary.id)}`, {
        cache: "no-store",
      })
      if (!res.ok) {
        setFetchError("Could not load order details.")
        return
      }
      setViewing(await res.json())
    } catch {
      setFetchError("Failed to load order details.")
    } finally {
      setLoadingView(false)
    }
  }

  useEffect(() => {
    void fetchNotifications()
  }, [])

  useEffect(() => {
    void fetchOrders(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when filter/page changes
  }, [statusFilter, page])

  const updateStatus = async (order: ShopOrder, status: OrderStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status }),
      })
      if (res.ok) {
        const updated: ShopOrder = await res.json()
        const { paymentImage: _p, ...summary } = updated
        setOrders((prev) => prev.map((o) => (o.id === order.id ? summary : o)))
        if (viewing?.id === order.id) {
          setViewing(updated)
          setShowInvoice(false)
        }
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
        setOrders((prev) => prev.filter((o) => o.id !== id))
        setTotal((t) => Math.max(0, t - 1))
        if (viewing?.id === id) {
          setViewing(null)
          setShowInvoice(false)
        }
        if (orders.length === 1 && page > 1) {
          setPage((p) => p - 1)
        } else {
          void fetchOrders(page)
        }
      }
    } catch {
      console.error("Failed to delete order")
    }
  }

  const handleExportCsv = async () => {
    const params = new URLSearchParams({ export: "1" })
    if (statusFilter !== "all") params.set("status", statusFilter)
    try {
      const res = await fetch(`/api/orders?${params}`, { cache: "no-store" })
      if (!res.ok) return
      const data: { orders: ShopOrderSummary[] } = await res.json()
      const suffix = statusFilter === "all" ? "all" : statusFilter
      downloadOrdersCsv(data.orders as ShopOrder[], `thebazm-orders-${suffix}`)
    } catch {
      /* ignore */
    }
  }

  const handleDownloadInvoice = async (order: ShopOrder) => {
    setIsDownloadingInvoice(true)
    try {
      await downloadOrderInvoicePdf(order)
    } catch (err) {
      console.error(err)
      alert("Failed to download invoice PDF")
    } finally {
      setIsDownloadingInvoice(false)
    }
  }

  const handlePrintInvoice = () => {
    if (!viewing || !invoiceRef.current) return
    printOrderInvoice(invoiceRef.current, viewing.orderNumber)
  }

  if (viewing && showInvoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowInvoice(false)}
          >
            ← Back to Order
          </Button>
          <div className="flex gap-2">
            {isMobile ? (
              <Button
                onClick={() => void handleDownloadInvoice(viewing)}
                disabled={isDownloadingInvoice}
              >
                {isDownloadingInvoice ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download PDF
              </Button>
            ) : (
              <Button onClick={handlePrintInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Print Invoice
              </Button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ShopOrderInvoiceTemplate ref={invoiceRef} order={viewing} />
        </div>
      </div>
    )
  }

  if (loadingView) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
      </div>
    )
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
              <span>Order total</span>
              <span className="text-primary">PKR {formatPrice(viewing.total)}</span>
            </div>
            {viewing.orderType === "pre_order" && (
              <>
                <div className="flex justify-between text-primary font-semibold">
                  <span>Advance paid</span>
                  <span>PKR {formatPrice(viewing.amountDueNow ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Balance due</span>
                  <span>PKR {formatPrice(viewing.balanceDue ?? 0)}</span>
                </div>
              </>
            )}
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
            <Button variant="outline" onClick={() => setShowInvoice(true)} className="gap-2">
              <FileText className="w-4 h-4" />
              View Invoice
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleDownloadInvoice(viewing)}
              disabled={isDownloadingInvoice}
              className="gap-2"
            >
              {isDownloadingInvoice ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download Invoice
            </Button>
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
      <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">Order email alerts</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Get an email when a customer places an order on the website.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0 text-sm font-semibold">
            <input
              type="checkbox"
              checked={notifications.enabled}
              onChange={(e) =>
                setNotifications({ ...notifications, enabled: e.target.checked })
              }
              className="w-4 h-4 accent-primary"
            />
            {notifications.enabled ? "On" : "Off"}
          </label>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium mb-1.5">Send alerts to</label>
            <Input
              type="email"
              value={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.value })
              }
              placeholder="you@example.com"
              disabled={!notifications.enabled}
            />
          </div>
          <Button
            onClick={() => void handleSaveNotifications()}
            disabled={isSavingNotifications}
            className="gap-2"
          >
            {isSavingNotifications ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </Button>
        </div>

        {notificationMessage && (
          <p className="text-sm text-green-600">{notificationMessage}</p>
        )}
        {notificationError && (
          <p className="text-sm text-red-600">{notificationError}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Alerts send when a customer completes checkout (from their browser — no API keys).
          The first order triggers a confirmation link in this inbox — click it once to activate.
          Keep the manager portal open for instant browser pop-ups too.
        </p>
        {typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void requestOrderAlertPermission()}
          >
            Enable browser alerts
          </Button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold">Shop Orders ({total})</h2>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => void fetchOrders(page)}>
                Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleExportCsv()}
                disabled={total === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const count =
                option.value === "all"
                  ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
                  : statusCounts[option.value as OrderStatus] ?? 0
              const active = statusFilter === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(option.value)
                    setPage(1)
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {option.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {fetchError && (
          <div className="p-4 text-sm text-red-600 border-b border-border">{fetchError}</div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {total === 0
              ? "No shop orders yet."
              : `No ${statusFilter === "all" ? "" : statusLabels[statusFilter as OrderStatus].toLowerCase()} orders.`}
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()} · PKR {formatPrice(order.total)} · {order.items.length} item(s)
                      {order.orderType === "pre_order" && " · Pre-order"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => void openOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteOrder(order.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-border flex flex-wrap items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-2">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground px-1">…</span>
                      )}
                      <Button
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                        disabled={loading}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
