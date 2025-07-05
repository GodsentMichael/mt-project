"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testCategoriesAPI = async () => {
    setLoading(true)
    setError("")
    try {
      console.log("Testing categories API...")
      const response = await fetch('/api/categories')
      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Data received:", data)
      setCategories(data)
    } catch (err) {
      console.error("Error:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testCategoriesAPI()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Categories API Test</h1>
      
      <Button onClick={testCategoriesAPI} disabled={loading}>
        {loading ? "Loading..." : "Test Categories API"}
      </Button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Categories ({categories.length}):</h2>
        <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>
      
      <Footer />
    </div>
    </div>
  )
}
