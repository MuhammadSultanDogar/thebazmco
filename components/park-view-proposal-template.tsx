"use client"

import { forwardRef } from "react"
import type { ParkViewProposal } from "@/lib/types/park-view-proposal"
import { PROPOSAL_LOGO_URL } from "@/lib/constants/park-view-proposal"

const colors = {
  purple: "#7B2D8E",
  purpleDark: "#5B1D6E",
  purpleLight: "#EDE4F5",
  pink: "#E91E8C",
  pinkLight: "#FDF0F7",
  pinkBorder: "#F5C6E0",
  text: "#1a1a1a",
  muted: "#555",
  white: "#ffffff",
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.pink} stroke={colors.pink} strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.pink} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DecorativeHero() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 140 }}>
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${colors.purpleLight} 0%, ${colors.pinkLight} 100%)`,
          border: `2px solid ${colors.pinkBorder}`,
        }}
      />
      {[
        { top: 20, left: 30, size: 36, bg: colors.pink, rot: -12 },
        { top: 50, left: 80, size: 28, bg: colors.purple, rot: 8 },
        { top: 30, right: 40, size: 32, bg: "#C084FC", rot: 15 },
        { bottom: 30, left: 50, size: 24, bg: colors.pink, rot: -8 },
        { bottom: 20, right: 30, size: 40, bg: colors.purple, rot: 5 },
      ].map((shape, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
            width: shape.size,
            height: shape.size,
            borderRadius: "50%",
            background: shape.bg,
            opacity: 0.85,
            transform: `rotate(${shape.rot}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: colors.muted,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        Event Ready
      </div>
    </div>
  )
}

export const ParkViewProposalTemplate = forwardRef<
  HTMLDivElement,
  { data: ParkViewProposal }
>(function ParkViewProposalTemplate({ data }, ref) {
  return (
    <div
      ref={ref}
      data-proposal-root
      style={{
        width: 794,
        minHeight: 1123,
        background: colors.white,
        fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
        color: colors.text,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* subtle background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #E91E8C 1px, transparent 1px), radial-gradient(circle at 80% 70%, #7B2D8E 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", padding: "28px 32px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <img
              src={PROPOSAL_LOGO_URL}
              alt="The Bazm.co"
              crossOrigin="anonymous"
              style={{ height: 72, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: colors.muted, letterSpacing: 1 }}>PROPOSAL FOR</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: 0.5 }}>
              {data.clientName}
            </p>
          </div>
        </div>

        {/* Hero */}
        <div style={{ display: "flex", gap: 20, marginBottom: 18, alignItems: "stretch" }}>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: "0 0 10px",
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: 0.3,
              }}
            >
              {data.eventTitle}
            </h1>
            <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: colors.muted, maxWidth: 420 }}>
              {data.introText}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: <ShieldIcon />, title: data.feature1Title, desc: data.feature1Description },
                { icon: <StarIcon />, title: data.feature2Title, desc: data.feature2Description },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    border: `1.5px solid ${colors.pinkBorder}`,
                    borderRadius: 10,
                    padding: "8px 10px",
                    background: colors.white,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {f.icon}
                    <span style={{ fontSize: 11, fontWeight: 800 }}>{f.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 9.5, color: colors.muted, lineHeight: 1.35 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: 200, flexShrink: 0 }}>
            {data.heroImageUrl ? (
              <img
                src={data.heroImageUrl}
                alt=""
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 16,
                  border: `2px solid ${colors.pinkBorder}`,
                }}
              />
            ) : (
              <DecorativeHero />
            )}
          </div>
        </div>

        {/* Option 01 - Purchase */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: `2px solid ${colors.purpleLight}`,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: colors.purple,
              color: colors.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CartIcon />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>OPTION 01</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>{data.purchaseTitle}</span>
            <div style={{ width: 20 }} />
          </div>
          <div
            style={{
              background: colors.purpleLight,
              padding: "14px 16px",
              display: "grid",
              gridTemplateColumns: "140px 1fr 170px",
              gap: 14,
              alignItems: "start",
            }}
          >
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: colors.white,
                  border: `2px solid ${colors.purple}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.purple} strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 9.5, lineHeight: 1.4, color: colors.muted, fontWeight: 600 }}>
                {data.purchaseTagline}
              </p>
            </div>

            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <tbody>
                  {data.purchaseItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < data.purchaseItems.length - 1 ? "1px solid #ddd" : "none" }}>
                      <td style={{ padding: "5px 8px", fontWeight: 700 }}>{item.name}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700 }}>
                        {item.price} PKR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", justifyContent: "center" }}>
                {data.purchaseItems.map((item, i) =>
                  item.iconUrl ? (
                    <img
                      key={i}
                      src={item.iconUrl}
                      alt={item.name}
                      crossOrigin="anonymous"
                      style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      key={i}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: colors.white,
                        border: `1.5px solid ${colors.purple}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9,
                        fontWeight: 800,
                        color: colors.purple,
                      }}
                    >
                      {item.name.slice(0, 2)}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div
              style={{
                background: colors.white,
                borderRadius: 10,
                padding: "10px 12px",
                border: `1.5px solid ${colors.purple}`,
              }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 800, textAlign: "center", color: colors.purple }}>
                EASY OWNERSHIP PROCESS
              </p>
              {data.ownershipSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: colors.purple,
                      color: colors.white,
                      fontSize: 10,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 9.5, fontWeight: 600 }}>{step}</span>
                </div>
              ))}
              <p style={{ margin: "6px 0 0", fontSize: 8, textAlign: "center", color: colors.muted }}>⏱ Fast turnaround</p>
            </div>
          </div>
        </div>

        {/* Option 02 - Performance */}
        <div
          style={{
            borderRadius: 14,
            overflow: "hidden",
            border: `2px solid ${colors.pinkBorder}`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: colors.pink,
              color: colors.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UsersIcon />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>OPTION 02</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.3 }}>{data.performanceTitle}</span>
            <div style={{ width: 20 }} />
          </div>
          <div
            style={{
              background: colors.pinkLight,
              padding: "16px 20px",
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 1fr",
              gap: 16,
              alignItems: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 900, letterSpacing: 0.3 }}>{data.performanceLabel}</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  background: colors.white,
                  border: `2px solid ${colors.pink}`,
                  borderRadius: 10,
                  padding: "12px 20px",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: colors.text }}>
                  {data.performanceRate} <span style={{ fontSize: 12 }}>PKR</span>
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, color: colors.purple }}>BOOKING CONFIRMATION</p>
                {data.bookingSteps.map((step, i) => (
                  <p key={i} style={{ margin: "0 0 3px", fontSize: 9, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ color: colors.pink }}>✓</span> {step}
                  </p>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ClockIcon />
              <p style={{ margin: 0, fontSize: 9.5, lineHeight: 1.4, fontWeight: 600, color: colors.muted }}>
                {data.performanceDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 200px", gap: 16, alignItems: "end", marginBottom: 12 }}>
          <div
            style={{
              border: `2px solid ${colors.pinkBorder}`,
              borderRadius: 10,
              padding: "10px 8px",
              textAlign: "center",
              background: colors.white,
            }}
          >
            <CalendarIcon />
            <p style={{ margin: "6px 0 0", fontSize: 9, fontWeight: 800, color: colors.purple }}>
              VALID {data.validityDays} DAYS
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                fontSize: 10,
                fontWeight: 800,
                color: colors.purple,
                letterSpacing: 1,
                padding: "4px 0",
              }}
            >
              HOW TO BOOK
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                <strong>Email:</strong> {data.contactEmail}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Phone:</strong> {data.contactPhone}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Website:</strong> {data.contactWebsite}
              </p>
            </div>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontStyle: "italic",
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: colors.text,
              textAlign: "right",
              lineHeight: 1.3,
            }}
          >
            {data.closingTagline}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            background: colors.purpleDark,
            borderRadius: "0 0 8px 8px",
            margin: "0 -32px -20px",
            padding: "10px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: colors.white,
            fontSize: 9,
            fontWeight: 600,
          }}
        >
          <span>{data.contactPhone}</span>
          <span>{data.instagramHandle}</span>
          <span>{data.contactEmail}</span>
          <span>{data.contactWebsite}</span>
        </div>
      </div>
    </div>
  )
})
