"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface Review {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  rating: number
  title?: string
  comment: string
  verified: boolean
  helpful: number
  createdAt: string
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

interface ReviewsResponse {
  reviews: Review[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalReviews: number
  }
  ratingDistribution: RatingDistribution[]
}

interface ProductReviewsProps {
  productSlug: string
  averageRating?: number
  reviewCount?: number
}

export function ProductReviews({ productSlug, averageRating = 0, reviewCount = 0 }: ProductReviewsProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchReviews(currentPage)
  }, [productSlug, currentPage])

  const fetchReviews = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productSlug}/reviews?page=${page}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setReviewsData(data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5"
    }

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading && !reviewsData) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!reviewsData) {
    return null
  }

  const { reviews, pagination, ratingDistribution } = reviewsData

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center gap-2">
            {renderStars(Math.round(averageRating), "lg")}
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-600">out of 5</span>
          </div>
          <p className="text-sm text-gray-600">{reviewCount} total reviews</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Rating Distribution</h4>
          {ratingDistribution.map((dist) => (
            <div key={dist.rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{dist.rating}★</span>
              <Progress value={dist.percentage} className="flex-1 h-2" />
              <span className="w-8 text-gray-600">{dist.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {review.userId.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{review.userId.name}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating, "sm")}
                        <span className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-medium text-sm mt-2">{review.title}</h4>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({review.helpful})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
