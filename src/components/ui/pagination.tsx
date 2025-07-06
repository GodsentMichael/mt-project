import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showNumbers?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showNumbers = true,
  className
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <nav className={cn("flex items-center justify-center space-x-1", className)}>
      {/* First Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>
      )}

      {/* Previous Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      {/* Page Numbers */}
      {showNumbers && totalPages <= 7 ? (
        // Show all pages if total is 7 or less
        Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))
      ) : showNumbers ? (
        // Show pages with ellipsis for more than 7 pages
        getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <Button variant="ghost" size="sm" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))
      ) : (
        // Simple page info without numbers
        <span className="px-3 py-2 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      )}

      {/* Next Page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      )}
    </nav>
  )
}

// Simple pagination component for basic use cases
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: Omit<PaginationProps, 'showFirstLast' | 'showNumbers'>) {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showFirstLast={false}
      showNumbers={false}
      className={className}
    />
  )
}
