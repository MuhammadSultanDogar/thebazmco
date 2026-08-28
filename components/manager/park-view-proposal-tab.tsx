"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  Loader2,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react"
import { ParkViewProposalTemplate } from "@/components/park-view-proposal-template"
import {
  DEFAULT_PARK_VIEW_PROPOSAL,
  normalizeParkViewProposal,
} from "@/lib/constants/park-view-proposal"
import type { ParkViewProposal, ParkViewPurchaseItem } from "@/lib/types/park-view-proposal"
import {
  downloadParkViewProposalPdf,
  printParkViewProposal,
} from "@/lib/utils/download-park-view-proposal"

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

export function ParkViewProposalTab() {
  const [proposal, setProposal] = useState<ParkViewProposal>(DEFAULT_PARK_VIEW_PROPOSAL)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const pdfRef = useRef<HTMLDivElement>(null)

  const loadProposal = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/park-view-proposal")
      if (!res.ok) throw new Error("Failed to load proposal")
      const data = await res.json()
      setProposal(normalizeParkViewProposal(data.proposal))
    } catch {
      setError("Could not load saved proposal. Using defaults.")
      setProposal(normalizeParkViewProposal(undefined))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProposal()
  }, [loadProposal])

  const update = <K extends keyof ParkViewProposal>(key: K, value: ParkViewProposal[K]) => {
    setProposal((prev) => ({ ...prev, [key]: value }))
  }

  const updatePurchaseItem = (index: number, patch: Partial<ParkViewPurchaseItem>) => {
    setProposal((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    }))
  }

  const addPurchaseItem = () => {
    setProposal((prev) => ({
      ...prev,
      purchaseItems: [...prev.purchaseItems, { name: "NEW ITEM", price: "0" }],
    }))
  }

  const removePurchaseItem = (index: number) => {
    setProposal((prev) => ({
      ...prev,
      purchaseItems: prev.purchaseItems.filter((_, i) => i !== index),
    }))
  }

  const updateStep = (
    key: "ownershipSteps" | "bookingSteps",
    index: number,
    value: string,
  ) => {
    setProposal((prev) => ({
      ...prev,
      [key]: prev[key].map((step, i) => (i === index ? value : step)),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/park-view-proposal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      })
      if (!res.ok) throw new Error("Save failed")
      const data = await res.json()
      setProposal(normalizeParkViewProposal(data.proposal))
      setMessage("Proposal saved.")
    } catch {
      setError("Failed to save proposal.")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!confirm("Reset all fields to default Park View City proposal?")) return
    setProposal(normalizeParkViewProposal(undefined))
    setMessage("Reset to defaults. Save to persist.")
  }

  const handleDownload = async () => {
    if (!pdfRef.current) return
    setDownloading(true)
    setError("")
    try {
      await downloadParkViewProposalPdf(pdfRef.current, proposal)
      setMessage("PDF downloaded.")
    } catch {
      setError("PDF download failed. Try Print instead.")
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    if (!pdfRef.current) return
    printParkViewProposal(pdfRef.current, proposal.clientName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading proposal…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Park View Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Edit the proposal below, then download or print a high-quality PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}

      <div className="grid xl:grid-cols-2 gap-8 items-start">
        {/* Editor */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <section className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Header & Introduction
            </h3>
            <Field label="Client name" value={proposal.clientName} onChange={(v) => update("clientName", v)} />
            <Field label="Event title" value={proposal.eventTitle} onChange={(v) => update("eventTitle", v)} />
            <Field
              label="Introduction"
              value={proposal.introText}
              onChange={(v) => update("introText", v)}
              multiline
            />
            <Field
              label="Hero image URL (optional)"
              value={proposal.heroImageUrl}
              onChange={(v) => update("heroImageUrl", v)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Feature 1 title"
                value={proposal.feature1Title}
                onChange={(v) => update("feature1Title", v)}
              />
              <Field
                label="Feature 1 description"
                value={proposal.feature1Description}
                onChange={(v) => update("feature1Description", v)}
              />
              <Field
                label="Feature 2 title"
                value={proposal.feature2Title}
                onChange={(v) => update("feature2Title", v)}
              />
              <Field
                label="Feature 2 description"
                value={proposal.feature2Description}
                onChange={(v) => update("feature2Description", v)}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Option 01 — Purchase
            </h3>
            <Field
              label="Section title"
              value={proposal.purchaseTitle}
              onChange={(v) => update("purchaseTitle", v)}
            />
            <Field
              label="Tagline"
              value={proposal.purchaseTagline}
              onChange={(v) => update("purchaseTagline", v)}
              multiline
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Mascot prices</span>
                <Button type="button" variant="outline" size="sm" onClick={addPurchaseItem}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add row
                </Button>
              </div>
              {proposal.purchaseItems.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_100px_1fr_auto] gap-2 items-end">
                  <Field label={i === 0 ? "Name" : ""} value={item.name} onChange={(v) => updatePurchaseItem(i, { name: v })} />
                  <Field label={i === 0 ? "Price (PKR)" : ""} value={item.price} onChange={(v) => updatePurchaseItem(i, { price: v })} />
                  <Field
                    label={i === 0 ? "Icon URL (optional)" : ""}
                    value={item.iconUrl ?? ""}
                    onChange={(v) => updatePurchaseItem(i, { iconUrl: v || undefined })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-500"
                    onClick={() => removePurchaseItem(i)}
                    disabled={proposal.purchaseItems.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            {proposal.ownershipSteps.map((step, i) => (
              <Field
                key={i}
                label={`Ownership step ${i + 1}`}
                value={step}
                onChange={(v) => updateStep("ownershipSteps", i, v)}
              />
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Option 02 — Performance
            </h3>
            <Field
              label="Section title"
              value={proposal.performanceTitle}
              onChange={(v) => update("performanceTitle", v)}
            />
            <Field
              label="Rate label"
              value={proposal.performanceLabel}
              onChange={(v) => update("performanceLabel", v)}
            />
            <Field
              label="Rate (PKR)"
              value={proposal.performanceRate}
              onChange={(v) => update("performanceRate", v)}
            />
            <Field
              label="Description"
              value={proposal.performanceDescription}
              onChange={(v) => update("performanceDescription", v)}
              multiline
            />
            {proposal.bookingSteps.map((step, i) => (
              <Field
                key={i}
                label={`Booking step ${i + 1}`}
                value={step}
                onChange={(v) => updateStep("bookingSteps", i, v)}
              />
            ))}
          </section>

          <section className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Footer & Contact
            </h3>
            <Field
              label="Validity (days)"
              value={proposal.validityDays}
              onChange={(v) => update("validityDays", v)}
            />
            <Field label="Email" value={proposal.contactEmail} onChange={(v) => update("contactEmail", v)} />
            <Field label="Phone" value={proposal.contactPhone} onChange={(v) => update("contactPhone", v)} />
            <Field label="Website" value={proposal.contactWebsite} onChange={(v) => update("contactWebsite", v)} />
            <Field
              label="Instagram"
              value={proposal.instagramHandle}
              onChange={(v) => update("instagramHandle", v)}
            />
            <Field
              label="Closing tagline"
              value={proposal.closingTagline}
              onChange={(v) => update("closingTagline", v)}
            />
          </section>
        </div>

        {/* Preview */}
        <div className="space-y-3 sticky top-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Live preview</p>
          <div
            className="overflow-auto rounded-2xl border border-border bg-muted/30 p-4"
            style={{ maxHeight: "80vh" }}
          >
            <div style={{ transform: "scale(0.55)", transformOrigin: "top left", width: 794 }}>
              <ParkViewProposalTemplate data={proposal} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size render for PDF capture */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <ParkViewProposalTemplate data={proposal} ref={pdfRef} />
      </div>
    </div>
  )
}
