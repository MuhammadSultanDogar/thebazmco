import { NextResponse } from "next/server"
import {
  assertSameOrigin,
  getClientIp,
  requireManagerAuth,
  tooManyRequestsResponse,
} from "@/lib/auth/manager"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { secureJson } from "@/lib/security/headers"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tagline: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
  },
  headerRight: {
    textAlign: "right",
    fontSize: 9,
    color: "#6b7280",
  },
  // Invoice Info Section
  invoiceInfoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  invoiceDetail: {
    fontSize: 9,
    marginBottom: 2,
  },
  billTo: {
    textAlign: "right",
  },
  billToTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  clientName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  clientContact: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Booking Details Box
  bookingBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bookingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  bookingItem: {
    width: "50%",
    marginBottom: 6,
    fontSize: 9,
  },
  bookingLabel: {
    fontWeight: "bold",
  },
  // Table
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    padding: 8,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  col1: { width: "35%" },
  col2: { width: "20%", textAlign: "center" },
  col3: { width: "25%", textAlign: "center" },
  col4: { width: "20%", textAlign: "right" },
  // Payment Summary
  paymentSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
  },
  paymentBox: {
    width: 200,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    fontSize: 9,
  },
  paymentRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "bold",
  },
  greenText: {
    color: "#16a34a",
  },
  // Terms Box
  termsBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  termItem: {
    fontSize: 7,
    color: "#6b7280",
    marginBottom: 3,
    flexDirection: "row",
  },
  // Footer
  footerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
  },
  // Stamp
  stampPaid: {
    borderWidth: 3,
    borderColor: "#16a34a",
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    transform: "rotate(-5deg)",
  },
  stampPending: {
    borderWidth: 3,
    borderColor: "#f59e0b",
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    transform: "rotate(-5deg)",
  },
  stampTextPaid: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  stampTextPending: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  stampSubtext: {
    fontSize: 7,
    textAlign: "center",
  },
  // Signature
  signatureSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  signatureBox: {
    textAlign: "center",
  },
  signatureLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 7,
    color: "#6b7280",
  },
})

const defaultTerms = `A 50% advance payment is required to confirm the booking.
The remaining amount must be cleared before the start of the event.
The client is responsible for ensuring the safety of the performer and the costume during the event. Any damage caused by the audience or guests will be chargeable to the client.
In case of event cancellation, notice must be given at least 48 hours in advance to be eligible for a refund of the advance payment.
If the event is delayed beyond the agreed performance time, it will not be our responsibility. Our team will be required to leave as per the committed schedule.
The client must arrange proper crowd control. Our performer has the right to pause or stop the performance if the environment becomes unsafe.
Exact performance timing must be shared in advance. Any extension beyond the agreed duration will be chargeable.
Travel time and setup time are not included in performance time.
We are not responsible for any technical issues at the venue such as lighting, sound, or space limitations.
Photos and videos from the event may be used on our social media for promotional purposes unless the client requests otherwise in advance.`

interface InvoiceData {
  invoiceNumber: string
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
  travelCost?: string
  subtotal: string
  advancePaid: string
  remainingPaid: string
  discount: string
  balance: string
  paymentMethod: string
  paymentStatus: string
  termsAndConditions?: string
  createdAt: string
}

function calculatePerformanceTime(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return "-"
  
  const [startHours, startMins] = startTime.split(":").map(Number)
  const [endHours, endMins] = endTime.split(":").map(Number)
  
  let totalStartMins = startHours * 60 + startMins
  let totalEndMins = endHours * 60 + endMins
  
  if (totalEndMins < totalStartMins) {
    totalEndMins += 24 * 60
  }
  
  const diffMins = totalEndMins - totalStartMins
  
  if (diffMins < 60) {
    return `${diffMins} minutes`
  } else if (diffMins === 60) {
    return "1 hour"
  } else if (diffMins === 90) {
    return "90 minutes"
  } else {
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ${mins} min`
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function InvoicePDF({ data }: { data: InvoiceData }) {
  const terms = data.termsAndConditions || defaultTerms
  const termsList = terms.split("\n").filter((t) => t.trim())
  const performanceTime = calculatePerformanceTime(data.startTime, data.endTime)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
              style={styles.logo}
            />
            <View>
              <Text style={styles.companyName}>THEBAZM.CO</Text>
              <Text style={styles.tagline}>Bringing Energy to Your Events!</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text>+92-3255105062</Text>
            <Text>thebazm.co@gmail.com</Text>
            <Text>www.thebazm.co</Text>
            <Text>@thebazm.co</Text>
          </View>
        </View>

        {/* Invoice Info & Client Info */}
        <View style={styles.invoiceInfoSection}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetail}>
              <Text style={styles.bookingLabel}>Invoice #: </Text>
              {data.invoiceNumber}
            </Text>
            <Text style={styles.invoiceDetail}>
              <Text style={styles.bookingLabel}>Date: </Text>
              {formatDate(data.createdAt)}
            </Text>
          </View>
          <View style={styles.billTo}>
            <Text style={styles.billToTitle}>BILL TO:</Text>
            <Text style={styles.clientName}>{data.clientName}</Text>
            <Text style={styles.clientContact}>{data.clientContact}</Text>
          </View>
        </View>

        {/* Booking Details Box */}
        <View style={styles.bookingBox}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.bookingGrid}>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>Event Date: </Text>
              {formatDate(data.eventDate)}
            </Text>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>Event Type: </Text>
              {data.eventType}
            </Text>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>City: </Text>
              {data.city}
            </Text>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>Location/Venue: </Text>
              {data.location}
            </Text>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>Start Time: </Text>
              {data.startTime}
            </Text>
            <Text style={styles.bookingItem}>
              <Text style={styles.bookingLabel}>End Time: </Text>
              {data.endTime}
            </Text>
          </View>
        </View>

        {/* Performance Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>No. of Costumes</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Performance Time</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Rate (PKR)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Main Gorilla Performance</Text>
            <Text style={styles.col2}>{data.numberOfCostumes}</Text>
            <Text style={styles.col3}>{performanceTime}</Text>
            <Text style={styles.col4}>{data.rate}</Text>
          </View>
          {data.travelCost && data.travelCost !== "0" && (
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Travel Cost</Text>
              <Text style={styles.col2}>-</Text>
              <Text style={styles.col3}>-</Text>
              <Text style={styles.col4}>{data.travelCost}</Text>
            </View>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentBox}>
            <View style={styles.paymentRow}>
              <Text>Subtotal:</Text>
              <Text>PKR {data.subtotal}</Text>
            </View>
            {data.advancePaid && data.advancePaid !== "0" && (
              <View style={styles.paymentRow}>
                <Text>Advance Paid:</Text>
                <Text style={styles.greenText}>- PKR {data.advancePaid}</Text>
              </View>
            )}
            {data.remainingPaid && data.remainingPaid !== "0" && (
              <View style={styles.paymentRow}>
                <Text>Remaining Paid:</Text>
                <Text style={styles.greenText}>- PKR {data.remainingPaid}</Text>
              </View>
            )}
            {data.discount && data.discount !== "0" && (
              <View style={styles.paymentRow}>
                <Text>Discount:</Text>
                <Text style={styles.greenText}>- PKR {data.discount}</Text>
              </View>
            )}
            <View style={styles.paymentRowBold}>
              <Text>Balance Due:</Text>
              <Text>PKR {data.balance}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text>Payment Method:</Text>
              <Text style={{ textTransform: "capitalize" }}>{data.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Terms Box */}
        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          {termsList.map((term, i) => (
            <Text key={i} style={styles.termItem}>
              • {term.replace(/^[•\-]\s*/, "")}
            </Text>
          ))}
        </View>

        {/* Footer with Stamp */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Thanks for choosing TheBazm.co - Let&apos;s make your event unforgettable!
          </Text>
          
          {/* Payment Status Stamp */}
          {data.paymentStatus === "paid" ? (
            <View style={styles.stampPaid}>
              <Text style={styles.stampTextPaid}>PAID</Text>
              <Text style={[styles.stampSubtext, { color: "#16a34a" }]}>Payment Cleared</Text>
            </View>
          ) : (
            <View style={styles.stampPending}>
              <Text style={styles.stampTextPending}>PENDING</Text>
              <Text style={[styles.stampSubtext, { color: "#f59e0b" }]}>Payment Pending</Text>
            </View>
          )}
        </View>

        {/* Signature Line */}
        {data.paymentStatus === "paid" && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Authorized Signature</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const authError = await requireManagerAuth()
  if (authError) return authError

  if (!assertSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const allowed = await enforceRateLimit(`invoice-pdf:${ip}`, {
    limit: 30,
    windowSeconds: 60 * 60,
  })
  if (!allowed) return tooManyRequestsResponse()

  try {
    const data: InvoiceData = await request.json()
    
    const pdfBuffer = await renderToBuffer(<InvoicePDF data={data} />)
    
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${data.invoiceNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
    return response
  } catch (error) {
    console.error("PDF generation error:", error)
    return secureJson(
      { error: "Failed to generate PDF" },
      { status: 500 },
    )
  }
}
