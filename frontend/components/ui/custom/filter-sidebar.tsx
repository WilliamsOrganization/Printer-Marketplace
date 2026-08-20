"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

type PriceRange = { id: string; label: string; min: number; max: number }

interface FilterSidebarProps {
  priceRanges: PriceRange[]
  selectedPriceRanges: string[]
}

export function FilterSidebar({
  priceRanges,
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
    params.delete("itemCost")
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const hasFilters = selectedPriceRanges.length > 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Price filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Price
            {selectedPriceRanges.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs size-4 flex items-center justify-center">
                {selectedPriceRanges.length}
              </span>
            )}
            <ChevronDown className="size-3 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="start">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Price</p>
          <div className="space-y-2">
            {priceRanges.map(range => (
              <div key={range.id} className="flex items-center gap-2">
                <Checkbox
                  id={range.id}
                  checked={selectedPriceRanges.includes(range.id)}
                  onCheckedChange={(checked) =>
                    updateParams("itemCost", range.id, checked as boolean)
                  }
                />
                <Label htmlFor={range.id} className="text-sm cursor-pointer">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <>
          <Separator orientation="vertical" className="h-5" />
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        </>
      )}
    </div>
  )
}
