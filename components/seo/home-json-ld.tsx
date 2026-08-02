import { FAQ_ITEMS } from "@/lib/constants/faq"
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/constants/contact"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site"
import { loadSiteData } from "@/lib/store"
import { getProductImages } from "@/lib/utils/product-images"

export async function HomeJsonLd() {
  const data = await loadSiteData()
  const products = data.mascots.filter((p) => p.active)

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    telephone: WHATSAPP_DISPLAY,
    sameAs: ["https://instagram.com/thebazm.co"],
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  }

  const store = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: `${SITE_NAME} — Inflatable Mascot Shop`,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/favicon.ico`,
    telephone: WHATSAPP_DISPLAY,
    email: CONTACT_EMAIL,
    priceRange: "PKR",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressRegion: "Islamabad Capital Territory",
    },
    areaServed: "Pakistan",
    paymentAccepted: "Bank Transfer",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Inflatable Mascots & Accessories",
    itemListElement: products.slice(0, 20).map((product, index) => {
      const images = getProductImages(product)
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: images[0] || undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: product.price.replace(/,/g, ""),
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/#mascots`,
          },
        },
      }
    }),
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/#mascots`,
      "query-input": "required name=search_term_string",
    },
  }

  const graph = [organization, store, website, faqPage, itemList]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
