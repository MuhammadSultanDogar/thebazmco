"use client"

import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { ParkViewProposal } from "@/lib/types/park-view-proposal"

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-|-$/g, "") || "proposal"
}

export async function downloadParkViewProposalPdf(
  element: HTMLElement,
  data: ParkViewProposal,
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
  })

  const imgData = canvas.toDataURL("image/png", 1.0)
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = pageWidth / imgWidth
  const scaledHeight = imgHeight * ratio

  if (scaledHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, scaledHeight, undefined, "FAST")
  } else {
    let heightLeft = scaledHeight
    let position = 0
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, scaledHeight, undefined, "FAST")
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, scaledHeight, undefined, "FAST")
      heightLeft -= pageHeight
    }
  }

  pdf.save(`Proposal-${sanitizeFilename(data.clientName)}.pdf`)
}

export function printParkViewProposal(element: HTMLElement, clientName: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) return

  const styles = `
    @page { size: A4 portrait; margin: 0; }
    body { margin: 0; padding: 0; background: white; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Proposal - ${clientName}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `)
  printWindow.document.close()
}
