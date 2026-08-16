"use client"

import { forwardRef } from "react"
import type { ShopOrderInvoiceData } from "@/lib/utils/shop-order-invoice"
import {
  formatInvoiceDate,
  formatPrice,
  lineItemTotal,
  orderInvoiceSummary,
  orderStatusLabels,
  SHOP_INVOICE_TERMS,
} from "@/lib/utils/shop-order-invoice"
import { PAYMENT_DETAILS } from "@/lib/constants/payment"

const LOGO_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"

export const ShopOrderInvoiceTemplate = forwardRef<
  HTMLDivElement,
  { order: ShopOrderInvoiceData }
>(function ShopOrderInvoiceTemplate({ order }, ref) {
  const { isPreOrder, paidNow, balance } = orderInvoiceSummary(order)
  const termsList = SHOP_INVOICE_TERMS.split("\n").filter((t) => t.trim())
  const statusLabel = orderStatusLabels[order.status]

  return (
    <div
      ref={ref}
      className="bg-white text-black p-8 max-w-[800px] mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div className="flex items-start justify-between border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="TheBazm Logo" className="w-28 h-28 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">THEBAZM.CO</h1>
            <p className="text-sm text-gray-600 italic">Inflatable Mascots & Accessories</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-600">
          <p>+92-3255105062</p>
          <p>thebazm.co@gmail.com</p>
          <p>www.thebazm.co</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">ORDER INVOICE</h2>
          <p className="text-sm">
            <span className="font-semibold">Order #:</span> {order.orderNumber}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Date:</span> {formatInvoiceDate(order.createdAt)}
          </p>
          {isPreOrder && (
            <p className="text-sm text-amber-700 font-semibold mt-1">Pre-order</p>
          )}
        </div>
        <div className="text-right">
          <h3 className="text-sm font-bold text-gray-800 mb-2">SHIP TO:</h3>
          <p className="text-sm font-semibold">{order.customerPhone}</p>
          <p className="text-sm text-gray-600 max-w-[240px] ml-auto">{order.customerAddress}</p>
        </div>
      </div>

      <table className="w-full mb-6 text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left p-3">Item</th>
            <th className="text-center p-3">Qty</th>
            <th className="text-right p-3">Unit (PKR)</th>
            <th className="text-right p-3">Total (PKR)</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={`${item.productId}-${i}`} className="border-b border-gray-200">
              <td className="p-3">{item.name}</td>
              <td className="text-center p-3">{item.quantity}</td>
              <td className="text-right p-3">{item.price}</td>
              <td className="text-right p-3">
                {formatPrice(lineItemTotal(item.price, item.quantity))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
            <span>Subtotal:</span>
            <span>PKR {formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
            <span>Shipping:</span>
            <span>{order.freeShipping ? "FREE" : `PKR ${formatPrice(order.shipping)}`}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-base border-b border-gray-200">
            <span>Order Total:</span>
            <span>PKR {formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm font-semibold text-primary">
            <span>{isPreOrder ? "Advance Paid:" : "Amount Paid:"}</span>
            <span>PKR {formatPrice(paidNow)}</span>
          </div>
          {isPreOrder && balance > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span>Balance Before Dispatch:</span>
              <span>PKR {formatPrice(balance)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 text-sm text-gray-600">
            <span>Payment Method:</span>
            <span>Bank Transfer (UBL)</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-sm">
        <p className="font-bold text-gray-800 mb-2 uppercase tracking-wide text-xs">Bank Details</p>
        <p><span className="text-gray-500">Name:</span> {PAYMENT_DETAILS.accountName}</p>
        <p><span className="text-gray-500">Bank:</span> {PAYMENT_DETAILS.bank}</p>
        <p><span className="text-gray-500">Account:</span> {PAYMENT_DETAILS.accountNumber}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
          Terms & Conditions
        </h3>
        <ul className="text-xs text-gray-600 space-y-2">
          {termsList.map((term, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between items-end">
        <p className="text-gray-500 text-sm italic">
          Thank you for shopping with TheBazm.co!
        </p>
        <div
          className={`border-4 rounded-lg px-6 py-3 transform rotate-[-5deg] ${
            order.status === "dispatched"
              ? "border-green-600"
              : order.status === "rejected"
                ? "border-red-500"
                : order.status === "approved"
                  ? "border-blue-600"
                  : "border-orange-500"
          }`}
        >
          <p
            className={`font-bold text-lg uppercase ${
              order.status === "dispatched"
                ? "text-green-600"
                : order.status === "rejected"
                  ? "text-red-500"
                  : order.status === "approved"
                    ? "text-blue-600"
                    : "text-orange-500"
            }`}
          >
            {statusLabel}
          </p>
        </div>
      </div>
    </div>
  )
})

ShopOrderInvoiceTemplate.displayName = "ShopOrderInvoiceTemplate"
