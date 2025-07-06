// Test script to debug wishlist functionality

async function testWishlistAPI() {
  console.log('Testing wishlist API endpoints...')
  
  try {
    // Test GET wishlist
    const getResponse = await fetch('http://localhost:3000/api/user/wishlist')
    console.log('GET wishlist status:', getResponse.status)
    
    if (getResponse.ok) {
      const wishlist = await getResponse.json()
      console.log('Current wishlist:', wishlist)
      
      if (wishlist.length > 0) {
        const firstItem = wishlist[0]
        console.log('First item:', firstItem)
        
        // Test DELETE with new endpoint
        const deleteResponse = await fetch(`http://localhost:3000/api/user/wishlist/${firstItem.productId._id}`, {
          method: 'DELETE'
        })
        console.log('DELETE status:', deleteResponse.status)
        
        if (deleteResponse.ok) {
          console.log('Delete successful')
          
          // Check local storage
          const localWishlist = localStorage.getItem('mctaylor-wishlist-storage')
          console.log('Local storage after delete:', localWishlist)
          
          // Check if deleted from server
          const verifyResponse = await fetch('http://localhost:3000/api/user/wishlist')
          const updatedWishlist = await verifyResponse.json()
          console.log('Updated wishlist after delete:', updatedWishlist)
        } else {
          const errorData = await deleteResponse.json()
          console.error('Delete failed:', errorData)
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Function to test UI-level wishlist deletion
async function testUIWishlistDeletion() {
  console.log('Testing UI-level wishlist deletion...')
  
  // Check if useWishlist hook is available
  if (typeof window !== 'undefined' && window.useWishlist) {
    const { deleteFromWishlist, serverWishlist } = window.useWishlist()
    
    if (serverWishlist.length > 0) {
      const firstItem = serverWishlist[0]
      console.log('Deleting item:', firstItem.productId.name)
      
      const success = await deleteFromWishlist(firstItem.productId._id)
      console.log('Deletion success:', success)
      
      // Check local storage after UI deletion
      const localWishlist = localStorage.getItem('mctaylor-wishlist-storage')
      console.log('Local storage after UI delete:', localWishlist)
    } else {
      console.log('No items in wishlist to delete')
    }
  } else {
    console.log('useWishlist hook not available in window scope')
  }
}

if (typeof window !== 'undefined') {
  // Run in browser
  testWishlistAPI()
  
  // Also expose the UI test function
  window.testUIWishlistDeletion = testUIWishlistDeletion
} else {
  console.log('This script should be run in the browser console')
}
