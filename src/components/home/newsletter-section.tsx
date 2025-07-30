"use client"

import type React from "react"

import { useState } from "react"
import { Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        toast.success("Thank you for subscribing to our newsletter!")
      } else {
        throw new Error("Subscription failed")
      }
    } catch (error) {
      toast.error("Subscription failed. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-brand-600 to-brand-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <Mail className="w-12 h-12 text-white mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-lg text-brand-100 mb-8">
            Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special
            offers.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center text-white">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="text-lg">Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-brand-600 hover:bg-brand-50 font-semibold px-8"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}

          <p className="text-sm text-brand-200 mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
    </section>
  )
}
