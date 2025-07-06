"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Store Info */}
        <div className="space-y-4">
        <h3 className="text-lg font-semibold text-brand-400">{settings.storeName}</h3>
        <p className="text-gray-300 text-sm">
          {settings.storeDescription}
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
          <Mail className="w-4 h-4 text-brand-400" />
          <a href={`mailto:${settings.storeEmail}`} className="hover:text-brand-400 transition-colors">
            {settings.storeEmail}
          </a>
          </div>
          <div className="flex items-center space-x-2 text-sm">
          <Phone className="w-4 h-4 text-brand-400" />
          <a href={`tel:${settings.storePhone}`} className="hover:text-brand-400 transition-colors">
            {settings.storePhone}
          </a>
          </div>
          <div className="flex items-start space-x-2 text-sm">
          <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
          <span className="text-gray-300">{settings.storeAddress}</span>
          </div>
        </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li>
          <Link href="/products" className="text-gray-300 hover:text-brand-400 transition-colors">
            All Products
          </Link>
          </li>
          <li>
          <Link href="/products?category=womens-fashion" className="text-gray-300 hover:text-brand-400 transition-colors">
            Women's Fashion
          </Link>
          </li>
          <li>
          <Link href="/products?category=mens-fashion" className="text-gray-300 hover:text-brand-400 transition-colors">
            Men's Fashion
          </Link>
          </li>
          <li>
          <Link href="/products?category=accessories" className="text-gray-300 hover:text-brand-400 transition-colors">
            Accessories
          </Link>
          </li>
          <li>
          <Link href="/wishlist" className="text-gray-300 hover:text-brand-400 transition-colors">
            Wishlist
          </Link>
          </li>
        </ul>
        </div>

        {/* Newsletter & Social */}
        <div className="space-y-4">
        <h3 className="text-lg font-semibold">Stay Connected</h3>
        <p className="text-gray-300 text-sm">
          Subscribe to our newsletter for the latest updates and exclusive offers.
        </p>
        <div className="flex space-x-4">
          <a
          href="#"
          className="text-gray-300 hover:text-brand-400 transition-colors"
          aria-label="Facebook"
          >
          <Facebook className="w-5 h-5" />
          </a>
          <a
          href="#"
          className="text-gray-300 hover:text-brand-400 transition-colors"
          aria-label="X"
          >
          {/* X (formerly Twitter) SVG icon */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.53 2.25h3.7l-7.98 9.14 9.4 10.36h-7.39l-5.8-6.67-6.64 6.67H1.18l8.52-9.59L.5 2.25h7.54l5.19 5.97 6.3-5.97zm-1.27 17.5h2.05L6.62 4.13H4.45l11.81 15.62z"/>
          </svg>
          </a>
          <a
          href="#"
          className="text-gray-300 hover:text-brand-400 transition-colors"
          aria-label="Instagram"
          >
          <Instagram className="w-5 h-5" />
          </a>
        </div>
        <div className="text-xs text-gray-400">
          <p>Currency: {settings.currency}</p>
        </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </div>
        <div className="flex space-x-6 text-sm">
          <Link href="/privacy" className="text-gray-400 hover:text-brand-400 transition-colors">
          Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-brand-400 transition-colors">
          Terms of Service
          </Link>
        </div>
        </div>
      </div>
      </div>
    </footer>
  )
}
