"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MessageCircle, Menu, X, ShoppingBag, Instagram, HelpCircle, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

const navLinks = [
  { href: "#mascots", label: "Shop", icon: ShoppingBag },
  { href: "#faq", label: "FAQ", icon: HelpCircle },
  { href: "#reels", label: "Reels", icon: Instagram },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState("#mascots")
  const { itemCount, openCart } = useCart()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })

    const sections = navLinks.map((l) => l.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: "-40% 0px -50% 0px" }
    )
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-primary/10 shadow-sm shadow-primary/5 py-2"
          : "bg-white/80 backdrop-blur-sm py-3"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="#" className="flex items-center gap-3 shrink-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-secondary border border-primary/15 p-1">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO%20SET%20%28THEBAZM.CO%29%20%281%29-Vyn5qZbbAAo85GDoYBp77NHmq9hJWu.png"
                alt="TheBazm"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-foreground leading-none">TheBazm</p>
              <p className="text-[11px] text-primary font-medium tracking-wide">thebazm.co</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-secondary/80 rounded-full px-2 py-1 border border-primary/10">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = active === link.href
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-full border-2 border-primary/20 hover:bg-secondary transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
            <a
              href="https://wa.me/923255105062"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-full hover:brightness-105 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Order Now
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl border border-primary/15 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-primary/10 pt-3">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  {link.label}
                </a>
              )
            })}
            <a
              href="https://wa.me/923255105062"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp
            </a>
            <button
              type="button"
              onClick={() => { openCart(); setMobileOpen(false) }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart ({itemCount})
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
