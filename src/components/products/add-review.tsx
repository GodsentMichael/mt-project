"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface AddReviewProps {
  productSlug: string
  onReviewAdded: () => void
}

export function AddReview({ productSlug, onReviewAdded }: AddReviewProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.error("Please login to add a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!comment.trim()) {
      toast.error("Please write a comment")
      return
    }

    if (comment.length > 1000) {
      toast.error("Comment must be less than 1000 characters")
      return
    }

    if (title.length > 100) {
      toast.error("Title must be less than 100 characters")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          comment: comment.trim()
        })
      })

      if (response.ok) {
        toast.success("Review added successfully!")
        setRating(0)
        setTitle("")
        setComment("")
        setIsOpen(false)
        onReviewAdded()
      } else {
        const error = await response.json()
        if (error.error === "You have already reviewed this product") {
          toast.error("You have already reviewed this product")
        } else {
          toast.error(error.error || "Failed to add review")
        }
      }
    } catch (error) {
      console.error('Error adding review:', error)
      toast.error("Failed to add review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`transition-colors ${interactive ? 'hover:scale-110' : ''}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-600 mb-4">Please login to add a review</p>
          <Button asChild>
            <a href="/auth/signin">Login</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!isOpen) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-gray-600 mb-4">Share your experience with this product</p>
          <Button onClick={() => setIsOpen(true)}>
            Write a Review
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="mt-1">
              {renderStars(true)}
            </div>
            {rating > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Review Title (Optional)
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your review"
              maxLength={100}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/100 characters
            </p>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Review Comment *
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this product"
              rows={4}
              maxLength={1000}
              className="mt-1 resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={rating === 0 || !comment.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
                setRating(0)
                setTitle("")
                setComment("")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
