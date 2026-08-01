"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LogOut,
  Save,
  Loader2,
  Plus,
  FileText,
  Printer,
  Eye,
  Trash2,
  X,
  Check,
  Download,
  ShoppingBag,
  Pencil,
  Package,
  Database,
} from "lucide-react"
import { InvoiceTemplate } from "@/components/invoice-template"
import { ShopOrdersTab } from "@/components/manager/shop-orders-tab"
import { ProductImagesInput } from "@/components/manager/product-images-input"
import { normalizeMascotProduct } from "@/lib/utils/product-images"
import { StorageTab } from "@/components/manager/storage-tab"
import type { MascotProduct, MascotAccessory } from "@/lib/types/mascot"


interface Invoice {
  id: string
  invoiceNumber: string
  createdAt: string
  clientName: string
  clientContact: string
  eventDate: string
  eventType: string
  city: string
  location: string
  startTime: string
  endTime: string
  numberOfCostumes: number
  rate: string
  travelCost: string
  subtotal: string
  advancePaid: string
  remainingPaid: string
  discount: string
  balance: string
  paymentMethod: "cash" | "transfer"
  paymentStatus: "pending" | "paid"
  termsAndConditions?: string
}

const defaultTerms = `A 50% advance payment is required to confirm the booking.
The remaining amount must be cleared before the start of the event.
The client is responsible for ensuring the safety of the performer and the costume during the event. Any damage caused by the audience or guests will be chargeable to the client.
In case of event cancellation, notice must be given at least 48 hours in advance to be eligible for a refund of the advance payment.
If the event is delayed beyond the agreed performance time, it will not be our responsibility. Our team will be required to leave as per the committed schedule, even if the performance has not yet started.
The client must arrange proper crowd control. Our performer has the right to pause or stop the performance if the environment becomes unsafe.
Exact performance timing must be shared in advance. Any extension beyond the agreed duration will be chargeable.
Travel time and setup time are not included in performance time.
We are not responsible for any technical issues at the venue such as lighting, sound, or space limitations.
Photos and videos from the event may be used on our social media for promotional purposes unless the client requests otherwise in advance.`

export default function ManagerPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Login form
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // Rates
  const [rates, setRates] = useState({
    "30min": "",
    "1hour": "",
    "1.5hours": "",
  })

  // Terms & Conditions
  const [terms, setTerms] = useState(defaultTerms)
  const [isSavingTerms, setIsSavingTerms] = useState(false)

  // Tabs
  const [activeTab, setActiveTab] = useState<"rates" | "invoices" | "terms" | "mascots" | "orders" | "storage">("rates")

  // Mascots
  const [mascots, setMascots] = useState<MascotProduct[]>([])
  const [editingMascot, setEditingMascot] = useState<MascotProduct | null>(null)
  const [showMascotForm, setShowMascotForm] = useState(false)
  const [isSavingMascot, setIsSavingMascot] = useState(false)

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    clientName: "",
    clientContact: "",
    eventDate: new Date().toISOString().split("T")[0],
    eventType: "",
    city: "",
    location: "",
    startTime: "",
    endTime: "",
    numberOfCostumes: 1,
    rate: "",
    travelCost: "0",
    subtotal: "",
    advancePaid: "0",
    remainingPaid: "0",
    discount: "0",
    balance: "",
    paymentMethod: "cash" as "cash" | "transfer",
    paymentStatus: "pending" as "pending" | "paid",
  })

  useEffect(() => {
    fetchRates()
    fetchInvoices()
    fetchTerms()
    fetchMascots()
  }, [])

  // Auto-calculate subtotal when rate or travel cost changes
  useEffect(() => {
    const rateNum = parseFloat(invoiceForm.rate.replace(/,/g, "")) || 0
    const travelNum = parseFloat(invoiceForm.travelCost.replace(/,/g, "")) || 0
    const subtotal = rateNum + travelNum
    setInvoiceForm((prev) => ({
      ...prev,
      subtotal: subtotal > 0 ? subtotal.toLocaleString() : "",
    }))
  }, [invoiceForm.rate, invoiceForm.travelCost])

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/rates")
      if (res.ok) {
        const data = await res.json()
        setRates(data)
      }
    } catch {
      console.error("Failed to fetch rates")
    }
  }

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices")
      if (res.ok) {
        const data = await res.json()
        setInvoices(data)
      }
    } catch {
      console.error("Failed to fetch invoices")
    }
  }

  const fetchTerms = async () => {
    try {
      const res = await fetch("/api/terms")
      if (res.ok) {
        const data = await res.json()
        if (data.terms) {
          setTerms(data.terms)
        }
      }
    } catch {
      console.error("Failed to fetch terms")
    }
  }

  const fetchMascots = async () => {
    try {
      const res = await fetch("/api/mascots?all=true")
      if (res.ok) {
        const data = await res.json()
        setMascots(data)
      }
    } catch {
      console.error("Failed to fetch mascots")
    }
  }

  const emptyMascot = (): MascotProduct => ({
    id: "",
    name: "",
    description: "",
    price: "",
    image: "",
    images: [],
    shipping: "",
    accessories: [],
    category: "mascot",
    featured: false,
    active: true,
    sortOrder: mascots.length + 1,
  })

  const handleSaveMascot = async () => {
    if (!editingMascot) return
    setIsSavingMascot(true)
    setError("")

    try {
      const isNew = !editingMascot.id
      const payload = normalizeMascotProduct(editingMascot)
      const res = await fetch("/api/mascots", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchMascots()
        setShowMascotForm(false)
        setEditingMascot(null)
        setSuccess(isNew ? "Mascot added successfully!" : "Mascot updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to save mascot")
      }
    } catch {
      setError("Failed to save mascot. Please try again.")
    } finally {
      setIsSavingMascot(false)
    }
  }

  const handleDeleteMascot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mascot?")) return

    try {
      const res = await fetch(`/api/mascots?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setMascots(mascots.filter((m) => m.id !== id))
        setSuccess("Mascot deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch {
      setError("Failed to delete mascot")
    }
  }

  const updateMascotField = (field: keyof MascotProduct, value: string | boolean | number) => {
    if (!editingMascot) return
    setEditingMascot({ ...editingMascot, [field]: value })
  }

  const addAccessory = () => {
    if (!editingMascot) return
    const newAcc: MascotAccessory = {
      id: `acc-${Date.now()}`,
      name: "",
      price: "",
    }
    setEditingMascot({
      ...editingMascot,
      accessories: [...editingMascot.accessories, newAcc],
    })
  }

  const updateAccessory = (accId: string, field: "name" | "price", value: string) => {
    if (!editingMascot) return
    setEditingMascot({
      ...editingMascot,
      accessories: editingMascot.accessories.map((a) =>
        a.id === accId ? { ...a, [field]: value } : a
      ),
    })
  }

  const removeAccessory = (accId: string) => {
    if (!editingMascot) return
    setEditingMascot({
      ...editingMascot,
      accessories: editingMascot.accessories.filter((a) => a.id !== accId),
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (res.ok) {
        setIsLoggedIn(true)
        setUsername("")
        setPassword("")
        await fetchRates()
        await fetchInvoices()
        await fetchTerms()
        await fetchMascots()
      } else {
        setError("Invalid username or password")
      }
    } catch {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" })
    setIsLoggedIn(false)
  }

  const handleSaveRates = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      })

      if (res.ok) {
        setSuccess("Rates updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update rates")
      }
    } catch {
      setError("Failed to save rates. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTerms = async () => {
    setIsSavingTerms(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terms }),
      })

      if (res.ok) {
        setSuccess("Terms & Conditions updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update terms")
      }
    } catch {
      setError("Failed to save terms. Please try again.")
    } finally {
      setIsSavingTerms(false)
    }
  }

  const calculateBalance = () => {
    const subtotal = parseFloat(invoiceForm.subtotal.replace(/,/g, "")) || 0
    const advance = parseFloat(invoiceForm.advancePaid.replace(/,/g, "")) || 0
    const remaining = parseFloat(invoiceForm.remainingPaid.replace(/,/g, "")) || 0
    const discount = parseFloat(invoiceForm.discount.replace(/,/g, "")) || 0
    const balance = subtotal - advance - remaining - discount
    return balance.toLocaleString()
  }

  const handleCreateInvoice = async () => {
    setIsCreatingInvoice(true)
    setError("")

    const invoiceData = {
      ...invoiceForm,
      balance: calculateBalance(),
      termsAndConditions: terms,
    }

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (res.ok) {
        const newInvoice = await res.json()
        setInvoices([newInvoice, ...invoices])
        setShowInvoiceForm(false)
        setInvoiceForm({
          clientName: "",
          clientContact: "",
          eventDate: new Date().toISOString().split("T")[0],
          eventType: "",
          city: "",
          location: "",
          startTime: "",
          endTime: "",
          numberOfCostumes: 1,
          rate: "",
          travelCost: "0",
          subtotal: "",
          advancePaid: "0",
          remainingPaid: "0",
          discount: "0",
          balance: "",
          paymentMethod: "cash",
          paymentStatus: "pending",
        })
        setSuccess("Invoice created successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await res.json()
        setError(`Failed to create invoice: ${errorData.error || res.statusText} (Status: ${res.status})`)
      }
    } catch (err) {
      setError(`Failed to create invoice: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsCreatingInvoice(false)
    }
  }

  const handleUpdatePaymentStatus = async (invoice: Invoice, status: "pending" | "paid") => {
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...invoice, paymentStatus: status }),
      })

      if (res.ok) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === invoice.id ? { ...inv, paymentStatus: status } : inv
          )
        )
        if (viewingInvoice?.id === invoice.id) {
          setViewingInvoice({ ...viewingInvoice, paymentStatus: status })
        }
      }
    } catch {
      console.error("Failed to update payment status")
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const res = await fetch(`/api/invoices?id=${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setInvoices(invoices.filter((inv) => inv.id !== id))
      }
    } catch {
      console.error("Failed to delete invoice")
    }
  }

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handlePrint = () => {
    const printContent = invoiceRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${viewingInvoice?.invoiceNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    if (!viewingInvoice) {
      setError("No invoice selected.")
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/invoice-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(viewingInvoice),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Invoice-${viewingInvoice.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setSuccess("PDF downloaded successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(`Failed to download PDF: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl p-8 border border-border">
            <h1 className="text-2xl font-bold text-center mb-2">Manager Login</h1>
            <p className="text-muted-foreground text-center mb-8">
              TheBazm Management Portal
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Invoice View Modal
  if (viewingInvoice) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setViewingInvoice(null)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            <div className="flex gap-2">
              {viewingInvoice.paymentStatus === "pending" ? (
                <Button
                  variant="outline"
                  onClick={() => handleUpdatePaymentStatus(viewingInvoice, "paid")}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleUpdatePaymentStatus(viewingInvoice, "pending")}
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  Mark as Pending
                </Button>
              )}
{isMobile ? (
                <Button onClick={handleDownloadPDF} disabled={isDownloading}>
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <InvoiceTemplate ref={invoiceRef} data={viewingInvoice} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
            <p className="text-muted-foreground">Manage rates, invoices, mascots, and terms</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={activeTab === "rates" ? "default" : "outline"}
            onClick={() => setActiveTab("rates")}
          >
            Rate Management
          </Button>
          <Button
            variant={activeTab === "invoices" ? "default" : "outline"}
            onClick={() => setActiveTab("invoices")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            onClick={() => setActiveTab("orders")}
          >
            <Package className="w-4 h-4 mr-2" />
            Shop Orders
          </Button>
          <Button
            variant={activeTab === "mascots" ? "default" : "outline"}
            onClick={() => setActiveTab("mascots")}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Mascots
          </Button>
          <Button
            variant={activeTab === "terms" ? "default" : "outline"}
            onClick={() => setActiveTab("terms")}
          >
            Terms & Conditions
          </Button>
          <Button
            variant={activeTab === "storage" ? "default" : "outline"}
            onClick={() => setActiveTab("storage")}
          >
            <Database className="w-4 h-4 mr-2" />
            Data Storage
          </Button>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">{error}</p>
        )}

        {success && (
          <p className="text-green-500 text-sm mb-4 p-3 bg-green-50 rounded-lg">{success}</p>
        )}

        {/* Rates Tab */}
        {activeTab === "rates" && (
          <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Rate for 30 Minutes (PKR)
              </label>
              <Input
                type="text"
                value={rates["30min"]}
                onChange={(e) => setRates({ ...rates, "30min": e.target.value })}
                placeholder="e.g., 22,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rate for 1 Hour (PKR)
              </label>
              <Input
                type="text"
                value={rates["1hour"]}
                onChange={(e) => setRates({ ...rates, "1hour": e.target.value })}
                placeholder="e.g., 28,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rate for 1.5 Hours (PKR)
              </label>
              <Input
                type="text"
                value={rates["1.5hours"]}
                onChange={(e) => setRates({ ...rates, "1.5hours": e.target.value })}
                placeholder="e.g., 35,000"
              />
            </div>

            <Button onClick={handleSaveRates} className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Rates
                </>
              )}
            </Button>

            <p className="text-muted-foreground text-sm text-center">
              Changes will be reflected on the main website immediately.
            </p>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === "terms" && (
          <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Terms & Conditions (one per line)
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full min-h-[400px] p-4 bg-input border border-border rounded-lg text-sm font-mono resize-y"
                placeholder="Enter each term on a new line..."
              />
            </div>

            <Button onClick={handleSaveTerms} className="w-full" disabled={isSavingTerms}>
              {isSavingTerms ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Terms & Conditions
                </>
              )}
            </Button>

            <p className="text-muted-foreground text-sm text-center">
              These terms will appear on all new invoices.
            </p>
          </div>
        )}

        {/* Shop Orders Tab */}
        {activeTab === "orders" && <ShopOrdersTab />}

        {activeTab === "storage" && <StorageTab />}

        {/* Mascots Tab */}
        {activeTab === "mascots" && (
          <div className="space-y-6">
            {!showMascotForm ? (
              <>
                <Button
                  onClick={() => {
                    setEditingMascot(emptyMascot())
                    setShowMascotForm(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">All Products ({mascots.length})</h2>
                  </div>
                  {mascots.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No mascots yet. Add your first product above.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {mascots.map((mascot) => (
                        <div
                          key={mascot.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50 gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {mascot.image && (
                              <img
                                src={mascot.image}
                                alt={mascot.name}
                                className="w-14 h-14 rounded-lg object-contain bg-white border border-border flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{mascot.name}</p>
                              <p className="text-sm text-muted-foreground">
                                PKR {mascot.price}
                                {mascot.shipping ? ` · Shipping PKR ${mascot.shipping}` : ""}
                              </p>
                              <span
                                className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                                  mascot.category === "accessory"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-secondary text-foreground"
                                }`}
                              >
                                {mascot.category === "accessory" ? "Accessory" : "Mascot"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                mascot.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {mascot.active ? "Active" : "Hidden"}
                            </span>
                            {mascot.featured && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                Featured
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingMascot({ ...mascot })
                                setShowMascotForm(true)
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteMascot(mascot.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              editingMascot && (
                <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {editingMascot.id ? "Edit Product" : "Add New Product"}
                    </h2>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowMascotForm(false)
                        setEditingMascot(null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Product Name</label>
                      <Input
                        value={editingMascot.name}
                        onChange={(e) => updateMascotField("name", e.target.value)}
                        placeholder="e.g., Inflatable Black Gorilla"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={editingMascot.description}
                        onChange={(e) => updateMascotField("description", e.target.value)}
                        className="w-full min-h-[100px] p-3 bg-input border border-border rounded-lg text-sm resize-y"
                        placeholder="Product description for the website..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price (PKR)</label>
                      <Input
                        value={editingMascot.price}
                        onChange={(e) => updateMascotField("price", e.target.value)}
                        placeholder="e.g., 99,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Shipping (PKR)</label>
                      <Input
                        value={editingMascot.shipping}
                        onChange={(e) => updateMascotField("shipping", e.target.value)}
                        placeholder="e.g., 2,500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={editingMascot.category || "mascot"}
                        onChange={(e) =>
                          updateMascotField("category", e.target.value as "mascot" | "accessory")
                        }
                        className="w-full p-3 bg-input border border-border rounded-lg text-sm"
                      >
                        <option value="mascot">Mascot</option>
                        <option value="accessory">Accessory</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <ProductImagesInput
                        images={editingMascot.images ?? (editingMascot.image ? [editingMascot.image] : [])}
                        onChange={(images) => {
                          setEditingMascot({
                            ...editingMascot,
                            images,
                            image: images[0] ?? "",
                          })
                        }}
                        onError={setError}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMascot.featured}
                          onChange={(e) => updateMascotField("featured", e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Featured product</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMascot.active}
                          onChange={(e) => updateMascotField("active", e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm font-medium">Visible on website</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Add-ons / Extra Fields
                      </h3>
                      <Button type="button" variant="outline" size="sm" onClick={addAccessory}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Field
                      </Button>
                    </div>
                    {editingMascot.accessories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No add-ons yet. Add fields like Battery, Charger, Connector, etc.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {editingMascot.accessories.map((acc) => (
                          <div key={acc.id} className="flex gap-3 items-start">
                            <Input
                              value={acc.name}
                              onChange={(e) => updateAccessory(acc.id, "name", e.target.value)}
                              placeholder="Field name (e.g., Battery)"
                              className="flex-1"
                            />
                            <Input
                              value={acc.price}
                              onChange={(e) => updateAccessory(acc.id, "price", e.target.value)}
                              placeholder="Price (PKR)"
                              className="w-36"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAccessory(acc.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleSaveMascot} className="w-full" disabled={isSavingMascot}>
                    {isSavingMascot ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {editingMascot.id ? "Update Mascot" : "Add Mascot"}
                      </>
                    )}
                  </Button>
                </div>
              )
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div className="space-y-6">
            {!showInvoiceForm ? (
              <>
                <Button onClick={() => setShowInvoiceForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Invoice
                </Button>

                {/* Invoice List */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold">All Invoices ({invoices.length})</h2>
                  </div>
                  {invoices.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No invoices created yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.clientName} - {invoice.eventType}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(invoice.eventDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                invoice.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {invoice.paymentStatus === "paid" ? "Paid" : "Pending"}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingInvoice(invoice)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Invoice Form */
              <div className="bg-card rounded-2xl p-8 border border-border space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Create New Invoice</h2>
                  <Button variant="ghost" onClick={() => setShowInvoiceForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Client Info */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Client Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Client Name</label>
                      <Input
                        value={invoiceForm.clientName}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, clientName: e.target.value })
                        }
                        placeholder="Enter client name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contact (Phone/Instagram)
                      </label>
                      <Input
                        value={invoiceForm.clientContact}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, clientContact: e.target.value })
                        }
                        placeholder="e.g., +92-xxx or @instagram"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Date</label>
                      <Input
                        type="date"
                        value={invoiceForm.eventDate}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, eventDate: e.target.value })
                        }
                        className="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Type</label>
                      <Input
                        value={invoiceForm.eventType}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, eventType: e.target.value })
                        }
                        placeholder="e.g., Wedding, Birthday, Corporate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        value={invoiceForm.city}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, city: e.target.value })
                        }
                        placeholder="e.g., Islamabad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Location/Venue</label>
                      <Input
                        value={invoiceForm.location}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, location: e.target.value })
                        }
                        placeholder="e.g., Marriott Hotel"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Time</label>
                      <Input
                        type="time"
                        value={invoiceForm.startTime}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, startTime: e.target.value })
                        }
                        className="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Time</label>
                      <Input
                        type="time"
                        value={invoiceForm.endTime}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, endTime: e.target.value })
                        }
                        className="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Performance Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Performance Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Number of Costumes
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={invoiceForm.numberOfCostumes}
                        onChange={(e) =>
                          setInvoiceForm({
                            ...invoiceForm,
                            numberOfCostumes: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rate (PKR)</label>
                      <Input
                        value={invoiceForm.rate}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, rate: e.target.value })
                        }
                        placeholder="e.g., 28,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Travel Cost (PKR)</label>
                      <Input
                        value={invoiceForm.travelCost}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, travelCost: e.target.value })
                        }
                        placeholder="e.g., 5,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtotal (PKR)</label>
                      <Input
                        value={invoiceForm.subtotal}
                        disabled
                        className="bg-muted"
                        placeholder="Auto-calculated"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Rate + Travel Cost
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Advance Paid (PKR)</label>
                      <Input
                        value={invoiceForm.advancePaid}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, advancePaid: e.target.value })
                        }
                        placeholder="e.g., 14,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Remaining Paid (PKR)</label>
                      <Input
                        value={invoiceForm.remainingPaid}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, remainingPaid: e.target.value })
                        }
                        placeholder="e.g., 14,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Discount (PKR)</label>
                      <Input
                        value={invoiceForm.discount}
                        onChange={(e) =>
                          setInvoiceForm({ ...invoiceForm, discount: e.target.value })
                        }
                        placeholder="e.g., 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Balance Due</label>
                      <Input value={`PKR ${calculateBalance()}`} disabled className="bg-muted" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Method</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={invoiceForm.paymentMethod === "cash"}
                            onChange={() =>
                              setInvoiceForm({ ...invoiceForm, paymentMethod: "cash" })
                            }
                            className="w-4 h-4"
                          />
                          <span>Cash</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={invoiceForm.paymentMethod === "transfer"}
                            onChange={() =>
                              setInvoiceForm({ ...invoiceForm, paymentMethod: "transfer" })
                            }
                            className="w-4 h-4"
                          />
                          <span>Transfer</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Payment Status</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={invoiceForm.paymentStatus === "pending"}
                            onChange={() =>
                              setInvoiceForm({ ...invoiceForm, paymentStatus: "pending" })
                            }
                            className="w-4 h-4"
                          />
                          <span>Pending</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentStatus"
                            checked={invoiceForm.paymentStatus === "paid"}
                            onChange={() =>
                              setInvoiceForm({ ...invoiceForm, paymentStatus: "paid" })
                            }
                            className="w-4 h-4"
                          />
                          <span>Paid</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateInvoice}
                  className="w-full"
                  disabled={isCreatingInvoice}
                >
                  {isCreatingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
