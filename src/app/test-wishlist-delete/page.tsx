"use client"

import { useWishlist } from "@/hooks/use-wishlist"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2 } from "lucide-react"

export default function TestWishlistPage() {
  const { serverWishlist, deleteFromWishlist, isLoading } = useWishlist()

  const handleDelete = async (productId: string, productName: string) => {
    console.log(`Testing deletion of ${productName} (${productId})`)
    const success = await deleteFromWishlist(productId)
    console.log(`Deletion result: ${success}`)
    
    // Check local storage after deletion
    setTimeout(() => {
      const localWishlist = localStorage.getItem('mctaylor-wishlist-storage')
      console.log('Local storage after delete:', localWishlist)
    }, 500)
  }

  const checkLocalStorage = () => {
    const localWishlist = localStorage.getItem('mctaylor-wishlist-storage')
    console.log('Current local storage:', localWishlist)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Wishlist Deletion Test</h1>
      
      <div className="mb-4">
        <Button onClick={checkLocalStorage} variant="outline">
          Check Local Storage
        </Button>
      </div>

      <div className="grid gap-4">
        {serverWishlist.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{item.productId.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.productId._id, item.productId.name)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Product ID: {item.productId._id}</p>
              <p>Price: ₦{item.productId.price.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
        
        {serverWishlist.length === 0 && (
          <p className="text-gray-500">No items in wishlist</p>
        )}
      </div>
    </div>
  )
}
