import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer"
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

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#1f2937",
    paddingBottom: 15,
  },
  logo: { width: 60, height: 60 },
  companyName: { fontSize: 16, fontWeight: "bold", color: "#1f2937" },
  tagline: { fontSize: 9, color: "#6b7280", fontStyle: "italic" },
  headerRight: { textAlign: "right", fontSize: 9, color: "#6b7280" },
  infoSection: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  title: { fontSize: 14, fontWeight: "bold", color: "#1f2937", marginBottom: 6 },
  detail: { fontSize: 9, marginBottom: 2 },
  shipTo: { textAlign: "right", maxWidth: 200 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    padding: 8,
  },
  tableHeaderText: { color: "#ffffff", fontWeight: "bold", fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
  },
  colItem: { width: "40%" },
  colQty: { width: "15%", textAlign: "center" },
  colUnit: { width: "22%", textAlign: "right" },
  colTotal: { width: "23%", textAlign: "right" },
  summary: { alignItems: "flex-end", marginBottom: 14 },
  summaryBox: { width: 220 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    fontSize: 9,
  },
  summaryBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  bankBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  termsBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  termItem: { fontSize: 7, color: "#6b7280", marginBottom: 3 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerText: { fontSize: 9, color: "#6b7280", fontStyle: "italic" },
  stamp: {
    borderWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    transform: "rotate(-5deg)",
  },
  stampText: { fontSize: 12, fontWeight: "bold", textAlign: "center" },
})

function stampColor(status: ShopOrderInvoiceData["status"]) {
  if (status === "dispatched") return { border: "#16a34a", text: "#16a34a" }
  if (status === "rejected") return { border: "#ef4444", text: "#ef4444" }
  if (status === "approved") return { border: "#2563eb", text: "#2563eb" }
  return { border: "#f59e0b", text: "#f59e0b" }
}

export function ShopOrderInvoicePDF({ order }: { order: ShopOrderInvoiceData }) {
  const { isPreOrder, paidNow, balance } = orderInvoiceSummary(order)
  const termsList = SHOP_INVOICE_TERMS.split("\n").filter((t) => t.trim())
  const stamp = stampColor(order.status)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <Image src={LOGO_URL} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>THEBAZM.CO</Text>
              <Text style={styles.tagline}>Inflatable Mascots & Accessories</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text>+92-3255105062</Text>
            <Text>thebazm.co@gmail.com</Text>
            <Text>www.thebazm.co</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View>
            <Text style={styles.title}>ORDER INVOICE</Text>
            <Text style={styles.detail}>Order #: {order.orderNumber}</Text>
            <Text style={styles.detail}>Date: {formatInvoiceDate(order.createdAt)}</Text>
            {isPreOrder && (
              <Text style={[styles.detail, { color: "#b45309", fontWeight: "bold" }]}>
                Pre-order
              </Text>
            )}
          </View>
          <View style={styles.shipTo}>
            <Text style={[styles.detail, { fontWeight: "bold" }]}>SHIP TO:</Text>
            <Text style={styles.detail}>{order.customerPhone}</Text>
            <Text style={styles.detail}>{order.customerAddress}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 12 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unit (PKR)</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total (PKR)</Text>
          </View>
          {order.items.map((item, i) => (
            <View key={`${item.productId}-${i}`} style={styles.tableRow}>
              <Text style={styles.colItem}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.price}</Text>
              <Text style={styles.colTotal}>
                {formatPrice(lineItemTotal(item.price, item.quantity))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>Subtotal:</Text>
              <Text>PKR {formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Shipping:</Text>
              <Text>
                {order.freeShipping ? "FREE" : `PKR ${formatPrice(order.shipping)}`}
              </Text>
            </View>
            <View style={styles.summaryBold}>
              <Text>Order Total:</Text>
              <Text>PKR {formatPrice(order.total)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>{isPreOrder ? "Advance Paid:" : "Amount Paid:"}</Text>
              <Text>PKR {formatPrice(paidNow)}</Text>
            </View>
            {isPreOrder && balance > 0 && (
              <View style={styles.summaryRow}>
                <Text>Balance Before Dispatch:</Text>
                <Text>PKR {formatPrice(balance)}</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text>Payment Method:</Text>
              <Text>Bank Transfer (UBL)</Text>
            </View>
          </View>
        </View>

        <View style={styles.bankBox}>
          <Text style={{ fontWeight: "bold", marginBottom: 4, fontSize: 9 }}>Bank Details</Text>
          <Text style={styles.detail}>Name: {PAYMENT_DETAILS.accountName}</Text>
          <Text style={styles.detail}>Bank: {PAYMENT_DETAILS.bank}</Text>
          <Text style={styles.detail}>Account: {PAYMENT_DETAILS.accountNumber}</Text>
        </View>

        <View style={styles.termsBox}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          {termsList.map((term, i) => (
            <Text key={i} style={styles.termItem}>
              • {term}
            </Text>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for shopping with TheBazm.co!</Text>
          <View style={[styles.stamp, { borderColor: stamp.border }]}>
            <Text style={[styles.stampText, { color: stamp.text }]}>
              {orderStatusLabels[order.status].toUpperCase()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export async function renderShopOrderInvoicePdf(order: ShopOrderInvoiceData): Promise<Buffer> {
  return renderToBuffer(<ShopOrderInvoicePDF order={order} />)
}
