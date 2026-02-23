import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function PromoBanner() {
  return (
    <div className="w-full bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-center gap-6 text-xs tracking-wide">
        <p>
          Free shipping on orders over $75 &mdash;{" "}
          <span className="italic font-serif text-sm">made to order, every time.</span>
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity whitespace-nowrap"
        >
          Shop now <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
