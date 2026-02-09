"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SearchBarMain from "@/components/ui/custom/searchbar"

const products = [
  { id: 1, name: "Abstract Sunset", price: 49.99, image: "/globe.svg", category: "prints", badge: "New" },
  { id: 2, name: "Mountain Vista", price: 59.99, image: "/globe.svg", category: "posters", badge: "Best Seller" },
  { id: 3, name: "Ocean Waves", price: 39.99, image: "/globe.svg", category: "canvas", badge: "Sale" },
  { id: 4, name: "Forest Path", price: 54.99, image: "/globe.svg", category: "prints" },
  { id: 5, name: "City Lights", price: 44.99, image: "/globe.svg", category: "posters" },
  { id: 6, name: "Desert Dunes", price: 64.99, image: "/globe.svg", category: "canvas" },
  { id: 7, name: "Northern Lights", price: 74.99, image: "/globe.svg", category: "prints", badge: "New" },
  { id: 8, name: "Tropical Beach", price: 49.99, image: "/globe.svg", category: "posters" },
  { id: 9, name: "Autumn Forest", price: 54.99, image: "/globe.svg", category: "canvas" },
  { id: 10, name: "Starry Night", price: 69.99, image: "/globe.svg", category: "prints" },
  { id: 11, name: "Urban Street", price: 44.99, image: "/globe.svg", category: "posters" },
  { id: 12, name: "Zen Garden", price: 59.99, image: "/globe.svg", category: "canvas" },
]

const categories = [
  { id: "prints", label: "Prints" },
  { id: "posters", label: "Posters" },
  { id: "canvas", label: "Canvas" },
  { id: "frames", label: "Frames" },
]

const priceRanges = [
  { id: "under50", label: "Under $50", min: 0, max: 50 },
  { id: "50to75", label: "$50 - $75", min: 50, max: 75 },
  { id: "over75", label: "Over $75", min: 75, max: Infinity },
]

type SortOption = "featured" | "price-asc" | "price-desc" | "name"

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("featured")

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    )
  }

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(rangeId)
        ? prev.filter(r => r !== rangeId)
        : [...prev, rangeId]
    )
  }

  const filteredProducts = products
    .filter(product => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const priceMatch = selectedPriceRanges.length === 0 || selectedPriceRanges.some(rangeId => {
        const range = priceRanges.find(r => r.id === rangeId)
        return range && product.price >= range.min && product.price < range.max
      })
      return categoryMatch && priceMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          // Badged items first, then by id
          if (a.badge && !b.badge) return -1
          if (!a.badge && b.badge) return 1
          return a.id - b.id
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <div className="mb-6">
              <SearchBarMain />
            </div>

            <h3 className="font-semibold mb-4">Filters</h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Category</h4>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={category.id} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Price</h4>
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <div key={range.id} className="flex items-center gap-2">
                    <Checkbox
                      id={range.id}
                      checked={selectedPriceRanges.includes(range.id)}
                      onCheckedChange={() => togglePriceRange(range.id)}
                    />
                    <Label htmlFor={range.id} className="text-sm cursor-pointer">
                      {range.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedPriceRanges([])
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products
            </p>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-square bg-muted">
                    {product.badge && (
                      <Badge
                        className="absolute top-2 left-2 z-10"
                        variant={product.badge === "Sale" ? "destructive" : "secondary"}
                      >
                        {product.badge}
                      </Badge>
                    )}
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-8 group-hover:scale-105 transition-transform"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 p-4">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                  <Button size="sm" className="w-full mt-2">Add to Cart</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products match your filters.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedPriceRanges([])
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
