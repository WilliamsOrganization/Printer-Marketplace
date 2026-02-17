import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function PromoBanner() {
  return (
    <div className="w-full bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between text-sm">
        <p>
          <Badge variant="secondary" className="mr-2">New</Badge>
          Spring Collection now available
        </p>
        <Link href="/products" className="flex items-center hover:underline">
          Shop Now <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
