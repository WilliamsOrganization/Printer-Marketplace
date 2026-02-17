import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FilterSidebar } from "@/components/ui/custom/filter-sidebar"
import { SortSelect } from "@/components/ui/custom/sort-select"

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

type SearchParams = {
  category?: string | string[]
  price?: string | string[]
  sort?: string
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // Parse params - handle both single values and arrays
  const selectedCategories = params.category
    ? Array.isArray(params.category) ? params.category : [params.category]
    : []
  const selectedPriceRanges = params.price
    ? Array.isArray(params.price) ? params.price : [params.price]
    : []
  const sortBy = params.sort || "featured"

  // Filter products on server
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
            <FilterSidebar
              categories={categories}
              priceRanges={priceRanges}
              selectedCategories={selectedCategories}
              selectedPriceRanges={selectedPriceRanges}
            />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} products
            </p>
            <SortSelect currentSort={sortBy} />
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
              <Button variant="link" asChild>
                <Link href="/">Clear filters</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
