"use client"

import { useState, useRef } from "react"
import { Loader2, Upload, CreditCard, MessageCircle, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import {
  PAYMENT_DETAILS,
  WHATSAPP_NUMBER,
  formatPrice,
  buildWhatsAppOrderMessage,
} from "@/lib/constants/payment"
import { CONTACT_EMAIL } from "@/lib/constants/contact"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/lib/utils/compress-image"
import { CheckoutAccessoryUpsell } from "@/components/shop/checkout-accessory-upsell"

export function CheckoutDialog() {
  const {
    items,
    subtotal,
    shipping,
    total,
    freeShipping,
    checkoutOpen,
    closeCheckout,
    clearCart,
    isPreOrder,
    mascotUnits,
    amountDueNow,
    balanceDue,
    preOrder,
  } = useCart()

  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [paymentImage, setPaymentImage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG)")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8MB")
      return
    }

    try {
      const compressed = await compressImage(file, 900, 0.68)
      setPaymentImage(compressed)
      setPreview(compressed)
      setError("")
    } catch {
      setError("Failed to process image")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone.trim()) return setError("Enter your phone number")
    if (!address.trim()) return setError("Enter your delivery address")
    if (!paymentImage) return setError("Upload your payment transfer screenshot")

    setSubmitting(true)
    try {
      const payload = {
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        paymentImage,
        orderType: isPreOrder ? "pre_order" : "standard",
        amountDueNow,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        subtotal,
        shipping,
        total,
        freeShipping,
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit order")
      }

      const order = await res.json()
      clearCart()
      closeCheckout()
      setPhone("")
      setAddress("")
      setPaymentImage(null)
      setPreview(null)

      const msg = buildWhatsAppOrderMessage(order)
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={checkoutOpen} onOpenChange={(open) => !open && closeCheckout()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isPreOrder ? "Pre-order — Reserve with Advance" : "Checkout — 100% Advance"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <CheckoutAccessoryUpsell />

          <div className="p-4 rounded-xl bg-secondary border border-primary/15 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CreditCard className="w-4 h-4" />
              Bank Transfer Details
            </div>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Name:</span> <strong>{PAYMENT_DETAILS.accountName}</strong></p>
              <p><span className="text-muted-foreground">Bank:</span> <strong>{PAYMENT_DETAILS.bank}</strong></p>
              <p><span className="text-muted-foreground">Account:</span> <strong className="text-primary">{PAYMENT_DETAILS.accountNumber}</strong></p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-medium hover:underline">{CONTACT_EMAIL}</a>
              </p>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-primary/10">
              {isPreOrder
                ? `Transfer PKR ${formatPrice(amountDueNow)} advance (${mascotUnits} mascot${mascotUnits !== 1 ? "s" : ""} × PKR ${formatPrice(preOrder.advanceAmount)}), then upload screenshot. Balance PKR ${formatPrice(balanceDue)} due before dispatch.`
                : `Transfer the full amount (PKR ${formatPrice(total)}) then upload screenshot below.`}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium text-center space-y-1">
            <p>Pay now: PKR {formatPrice(amountDueNow)}</p>
            {isPreOrder && mascotUnits > 0 && (
              <p className="text-xs opacity-90">
                {mascotUnits} mascot{mascotUnits !== 1 ? "s" : ""} × PKR {formatPrice(preOrder.advanceAmount)} advance each
              </p>
            )}
            {isPreOrder && balanceDue > 0 && (
              <p className="text-xs opacity-90">
                Pre-order total PKR {formatPrice(total)} · Balance PKR {formatPrice(balanceDue)} later
              </p>
            )}
            {freeShipping && !isPreOrder && " · Free Shipping ✓"}
            {freeShipping && isPreOrder && (
              <p className="text-xs opacity-90">Free shipping applied on order total</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone Number *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0321 1234567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Delivery Address *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address with city"
              required
              className="w-full min-h-[80px] p-3 bg-input border border-border rounded-lg text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Payment Screenshot *</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-primary/20">
                <img src={preview} alt="Payment proof" className="w-full max-h-48 object-contain bg-secondary" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    setPaymentImage(null)
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-foreground text-background rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center gap-2 hover:bg-secondary transition-colors"
              >
                <Upload className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium">Upload transfer screenshot</span>
                <span className="text-xs text-muted-foreground">JPG or PNG, max 5MB</span>
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button type="submit" disabled={submitting} className="w-full h-12 font-bold rounded-xl gap-2">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                {isPreOrder ? "Submit Pre-order & WhatsApp" : "Submit & Open WhatsApp"}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {isPreOrder
              ? "We'll confirm your reservation after reviewing your advance payment."
              : "Our team will review your payment in the manager portal before dispatching your order."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
