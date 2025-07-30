import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Verified Customer",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Amazing quality products and super fast delivery! I've been shopping here for months and never disappointed.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Verified Customer",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "The customer service is outstanding. They helped me find exactly what I needed and the prices are unbeatable.",
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Verified Customer",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment: "Love the variety of products available. The website is easy to navigate and checkout is seamless.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-brand-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-lg text-gray-600">Don't just take our word for it - hear from our satisfied customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>

                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
