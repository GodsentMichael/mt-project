import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoryGrid } from "@/components/home/category-grid"
import { TestimonialsSection } from "@/components/home/testimonial-section"
import { NewsletterSection } from "@/components/home/newsletter-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoryGrid />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}
