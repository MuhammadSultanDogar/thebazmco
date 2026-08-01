"use client"

import { useEffect, useRef, useState } from "react"
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SiteData, StorageInfo } from "@/lib/types/site-data"

function formatBytes(bytes: number | null) {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string | null) {
  if (!value) return "Never"
  return new Date(value).toLocaleString("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function StorageTab() {
  const [info, setInfo] = useState<StorageInfo | null>(null)
  const [preview, setPreview] = useState<SiteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [infoRes, exportRes] = await Promise.all([
        fetch("/api/store"),
        fetch("/api/store?mode=export"),
      ])

      if (infoRes.ok) setInfo(await infoRes.json())
      if (exportRes.ok) setPreview(await exportRes.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleExport = async () => {
    const res = await fetch("/api/store?mode=export")
    if (!res.ok) return
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `thebazm-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage("Backup downloaded.")
  }

  const handleImport = async (file: File | null) => {
    if (!file) return
    setImporting(true)
    setMessage("")
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", data }),
      })
      if (!res.ok) throw new Error("Import failed")
      const result = await res.json()
      setInfo(result.info)
      setPreview(result.data)
      setMessage("Backup restored successfully. Refresh other tabs to see changes.")
    } catch {
      setMessage("Import failed. Make sure the file is a valid TheBazm backup JSON.")
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-10 border border-border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Storage
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              See where your manager data lives and back it up anytime.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div
          className={`rounded-xl p-4 border ${
            info?.persistent
              ? "bg-green-50 border-green-200 text-green-900"
              : "bg-amber-50 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-start gap-3">
            {info?.persistent ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {info?.persistent ? "Persistent storage active" : "Data is NOT saved permanently"}
              </p>
              <p className="text-sm mt-1 opacity-90">{info?.message}</p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Backend", value: info?.backend ?? "—" },
            { label: "Last saved", value: formatDate(info?.updatedAt ?? null) },
            { label: "Store size", value: formatBytes(info?.blobSizeBytes ?? null) },
            { label: "Products", value: String(info?.counts.mascots ?? 0) },
            { label: "Active products", value: String(info?.counts.activeMascots ?? 0) },
            { label: "Shop orders", value: String(info?.counts.orders ?? 0) },
            { label: "Invoices", value: String(info?.counts.invoices ?? 0) },
            {
              label: "Configured",
              value: info?.configured ? "Yes" : "No",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border p-4 bg-background">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="font-semibold mt-1 break-all">{item.value}</p>
            </div>
          ))}
        </div>

        {!info?.persistent && (
          <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4 text-sm space-y-2">
            <p className="font-semibold text-primary">Enable permanent storage (free on Vercel)</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open your project on vercel.com</li>
              <li>Go to Storage → Create → Blob</li>
              <li>Connect it to this project</li>
              <li>Redeploy — Vercel adds BLOB_READ_WRITE_TOKEN automatically</li>
            </ol>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void handleExport()}>
            <Download className="w-4 h-4 mr-2" />
            Download backup
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => void handleImport(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Restore backup
          </Button>
        </div>

        {message && <p className="text-sm text-primary font-medium">{message}</p>}
      </div>

      {preview && (
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-3">Stored data preview</h3>
          <div className="max-h-[420px] overflow-auto rounded-xl bg-[#0f1117] text-[#e6edf3] p-4 text-xs font-mono">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(
                {
                  updatedAt: preview.updatedAt,
                  mascots: preview.mascots.map((m) => ({
                    id: m.id,
                    name: m.name,
                    price: m.price,
                    active: m.active,
                    category: m.category,
                    hasImage: Boolean(m.image),
                  })),
                  rates: preview.rates,
                  orders: preview.orders.map((o) => ({
                    orderNumber: o.orderNumber,
                    status: o.status,
                    total: o.total,
                    createdAt: o.createdAt,
                  })),
                  invoices: preview.invoices.map((i) => ({
                    invoiceNumber: i.invoiceNumber,
                    clientName: i.clientName,
                    paymentStatus: i.paymentStatus,
                  })),
                  termsLength: preview.terms.length,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
