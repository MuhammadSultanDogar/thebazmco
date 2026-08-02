"use client"

import { Instagram, MessageCircle, MapPin, ShoppingBag, HelpCircle, Mail } from "lucide-react"
import Image from "next/image"
import { CONTACT_EMAIL, WHATSAPP_NUMBER, INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants/contact"

export function Footer() {
  return (
    <footer className="py-10 bg-secondary border-t border-primary/15">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-5 rounded-2xl bg-white border border-primary/15 p-2 shadow-sm">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
              alt="TheBazm.co Logo"
              fill
              className="object-contain p-1"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-6">
            <a href="#mascots" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              <ShoppingBag className="w-3.5 h-3.5" /> Shop
            </a>
            <a href="#faq" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              <HelpCircle className="w-3.5 h-3.5" /> FAQ
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              <Instagram className="w-3.5 h-3.5" /> @{INSTAGRAM_HANDLE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              <Mail className="w-3.5 h-3.5" /> {CONTACT_EMAIL}
            </a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary font-medium transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> All Cities, Pakistan
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TheBazm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
