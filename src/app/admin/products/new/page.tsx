"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "sonner"

interface Category {
  _id: string
  name: string
  slug: string
}

interface ProductFormData {
  name: string
  description: string
  price: number
  comparePrice: number
  categoryId: string
  images: string[]
  featured: boolean
  stock: number
  sku: string
}

export default function NewProductPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categories, setCategories] = useState<Category[]>([])
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        comparePrice: 0,
        categoryId: "",
        images: [],
        featured: false,
        stock: 0,
        sku: "",
    })

    useEffect(() => {
        if (status === "loading") return

        if (!session || session.user.role !== "ADMIN") {
            router.push("/auth/signin")
            return
        }

        // Fetch categories and set them in state
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true)
                const response = await fetch('/api/categories', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                setCategories(data)
            } catch (error) {
                toast.error("Failed to load categories")
            } finally {
                setCategoriesLoading(false)
            }
        }

        fetchCategories()
    }, [session, status, router])

    const handleInputChange = (field: keyof ProductFormData, value: any) => {
        // Ensure categoryId is always a string
        if (field === "categoryId") {
            setFormData(prev => ({ ...prev, categoryId: value ? String(value) : "" }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }
    }

    const handleImageUpload = (urls: string[]) => {
        setFormData(prev => ({ ...prev, images: urls }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create product')
            }
            toast.success("Product created successfully")
            router.push('/admin/products')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create product")
        } finally {
            setLoading(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
            </div>
        )
    }

    if (!session || session.user.role !== "ADMIN") {
        return null
    }

    console.log("Categories state:", categories)
    console.log("Selected categoryId:", formData.categoryId)
    console.log("Categories loading:", categoriesLoading)

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-6 min-[1280px]:ml-64">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
                            <p className="text-gray-600 mt-2">Create a new product for your store</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Form */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Product Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium">Product Name</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="Enter product name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium">Description</label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                                                    rows={4}
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    placeholder="Enter product description"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">Price (₦)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.price}
                                                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Compare Price (₦)</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.comparePrice}
                                                        onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium">Stock Quantity</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.stock}
                                                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">SKU</label>
                                                    <Input
                                                        value={formData.sku}
                                                        onChange={(e) => handleInputChange('sku', e.target.value)}
                                                        placeholder="Enter SKU"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium">Category</label>
                                                {categoriesLoading ? (
                                                    <div className="text-sm text-gray-500">Loading categories...</div>
                                                ) : categories.length === 0 ? (
                                                    <div className="text-sm text-red-500">No categories available. Please create categories first.</div>
                                                ) : (
                                                    <>
                                                        <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select category..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {categories.map((category) => (
                                                                    <SelectItem key={category._id} value={category._id}>
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Available categories: {categories.map(c => c.name).join(', ')}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Product Images</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ImageUpload
                                                value={formData.images}
                                                onChange={handleImageUpload}
                                                maxFiles={5}
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Product Options</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="featured"
                                                    checked={formData.featured}
                                                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                                                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                                />
                                                <label htmlFor="featured" className="text-sm font-medium">
                                                    Featured Product
                                                </label>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-3">
                                        <Button type="submit" disabled={loading} className="w-full">
                                            {loading ? "Creating..." : "Create Product"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push('/admin/products')}
                                            className="w-full"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    )
}
