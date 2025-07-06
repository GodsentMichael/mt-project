import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Shield, Truck } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-100">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Trusted by 50,000+ customers
              </div>
              <h1 className="text-4xl lg:text-6xl font-heading font-bold text-gray-900 leading-tight">
                Discover Amazing
                <span className="text-brand-600 block">Products</span>
                at Great Prices
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Shop the latest trends with confidence. Fast shipping, secure payments, and exceptional customer service
                guaranteed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">Browse Categories</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-6 sm:pt-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-xs sm:text-sm">Free Shipping</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-xs sm:text-sm">Secure Payment</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-brand-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-xs sm:text-sm">Top Quality</p>
                  <p className="text-[10px] sm:text-xs text-gray-600">Premium products</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="relative z-10">
              <Image
                src="/flyer-8.jpg"
                alt="Hero Product"
                width={600}
                height={600}
                className="w-full h-auto rounded-2xl shadow-2xl"
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-brand-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-brand-300 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </section>
  )
}
