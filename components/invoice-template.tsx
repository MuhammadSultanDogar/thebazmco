"use client"

import { forwardRef } from "react"

interface InvoiceData {
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

interface InvoiceTemplateProps {
  data: InvoiceData
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

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(
  ({ data }, ref) => {
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    const terms = data.termsAndConditions || defaultTerms
    const termsList = terms.split("\n").filter((t) => t.trim())

    // Calculate performance time from start and end time
    const calculatePerformanceTime = () => {
      if (!data.startTime || !data.endTime) return "-"
      
      const [startHours, startMins] = data.startTime.split(":").map(Number)
      const [endHours, endMins] = data.endTime.split(":").map(Number)
      
      let totalStartMins = startHours * 60 + startMins
      let totalEndMins = endHours * 60 + endMins
      
      // Handle case where end time is past midnight
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

    const performanceTime = calculatePerformanceTime()

    return (
      <div
        ref={ref}
        className="bg-white text-black p-8 max-w-[800px] mx-auto"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
              alt="TheBazm Logo"
              className="w-32 h-32 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">THEBAZM.CO</h1>
              <p className="text-sm text-gray-600 italic">Bringing Energy to Your Events!</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>+92-3255105062</p>
            <p>thebazm.co@gmail.com</p>
            <p>www.thebazm.co</p>
            <p>@thebazm.co</p>
          </div>
        </div>

        {/* Invoice Info & Client Info */}
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">INVOICE</h2>
            <p className="text-sm">
              <span className="font-semibold">Invoice #:</span> {data.invoiceNumber}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Date:</span> {formatDate(data.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-gray-800 mb-2">BILL TO:</h3>
            <p className="text-sm font-semibold">{data.clientName}</p>
            <p className="text-sm text-gray-600">{data.clientContact}</p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">
            Booking Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Event Date:</span>{" "}
              {formatDate(data.eventDate)}
            </div>
            <div>
              <span className="font-semibold">Event Type:</span> {data.eventType}
            </div>
            <div>
              <span className="font-semibold">City:</span> {data.city}
            </div>
            <div>
              <span className="font-semibold">Location/Venue:</span> {data.location}
            </div>
            <div>
              <span className="font-semibold">Start Time:</span> {data.startTime}
            </div>
            <div>
              <span className="font-semibold">End Time:</span> {data.endTime}
            </div>
          </div>
        </div>

        {/* Performance Details Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="text-left p-3">Description</th>
              <th className="text-center p-3">No. of Costumes</th>
              <th className="text-center p-3">Performance Time</th>
              <th className="text-right p-3">Rate (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3">Main Gorilla Performance</td>
              <td className="text-center p-3">{data.numberOfCostumes}</td>
              <td className="text-center p-3">{performanceTime}</td>
              <td className="text-right p-3">{data.rate}</td>
            </tr>
            {data.travelCost && data.travelCost !== "0" && (
              <tr className="border-b border-gray-200">
                <td className="p-3">Travel Cost</td>
                <td className="text-center p-3">-</td>
                <td className="text-center p-3">-</td>
                <td className="text-right p-3">{data.travelCost}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Payment Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
              <span>Subtotal:</span>
              <span>PKR {data.subtotal}</span>
            </div>
            {data.advancePaid && data.advancePaid !== "0" && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span>Advance Paid:</span>
                <span className="text-green-600">- PKR {data.advancePaid}</span>
              </div>
            )}
            {data.remainingPaid && data.remainingPaid !== "0" && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span>Remaining Paid:</span>
                <span className="text-green-600">- PKR {data.remainingPaid}</span>
              </div>
            )}
            {data.discount && data.discount !== "0" && (
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span>Discount:</span>
                <span className="text-green-600">- PKR {data.discount}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-bold text-base">
              <span>Balance Due:</span>
              <span>PKR {data.balance}</span>
            </div>
            <div className="flex justify-between py-2 text-sm text-gray-600">
              <span>Payment Method:</span>
              <span className="capitalize">{data.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
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

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-center">
            <p className="text-gray-500 text-sm italic mb-4">
              Thanks for choosing TheBazm.co - Let&apos;s make your event unforgettable!
            </p>
          </div>
          
          {/* Payment Status / E-Stamp */}
          <div className="text-center">
            {data.paymentStatus === "paid" ? (
              <div className="border-4 border-green-600 rounded-lg px-6 py-3 transform rotate-[-5deg]">
                <p className="text-green-600 font-bold text-xl uppercase">PAID</p>
                <p className="text-green-600 text-xs">Payment Cleared</p>
              </div>
            ) : (
              <div className="border-4 border-orange-500 rounded-lg px-6 py-3 transform rotate-[-5deg]">
                <p className="text-orange-500 font-bold text-xl uppercase">PENDING</p>
                <p className="text-orange-500 text-xs">Payment Pending</p>
              </div>
            )}
          </div>
        </div>

        {/* Signature Line */}
        {data.paymentStatus === "paid" && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="text-center">
                <div className="w-48 border-b border-gray-400 mb-2"></div>
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)

InvoiceTemplate.displayName = "InvoiceTemplate"
