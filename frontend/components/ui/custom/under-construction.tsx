import { IconTools } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export function UnderConstruction({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center", className)}>
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <IconTools className="text-muted-foreground size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title} is under construction</p>
        <p className="text-muted-foreground text-sm">This page isn&apos;t built out yet - check back soon.</p>
      </div>
    </div>
  )
}
