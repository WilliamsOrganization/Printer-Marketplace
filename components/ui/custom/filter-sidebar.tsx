"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type Category = { id: string; label: string }
type PriceRange = { id: string; label: string; min: number; max: number }

interface FilterSidebarProps {
  categories: Category[]
  priceRanges: PriceRange[]
  selectedCategories: string[]
  selectedPriceRanges: string[]
}

export function FilterSidebar({
  categories,
  priceRanges,
  selectedCategories,
  selectedPriceRanges,
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.getAll(key)

      if (checked) {
        params.append(key, value)
      } else {
        params.delete(key)
        current.filter(v => v !== value).forEach(v => params.append(key, v))
      }

      router.push(`/?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("price")
    const newUrl = params.toString() ? `/?${params.toString()}` : "/"
    router.push(newUrl, { scroll: false })
  }

  const hasFilters = selectedCategories.length > 0 || selectedPriceRanges.length > 0

  return (
    <div>
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
                onCheckedChange={(checked) =>
                  updateParams("category", category.id, checked as boolean)
                }
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
                onCheckedChange={(checked) =>
                  updateParams("price", range.id, checked as boolean)
                }
              />
              <Label htmlFor={range.id} className="text-sm cursor-pointer">
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
