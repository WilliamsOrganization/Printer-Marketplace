import { IconTools } from "@tabler/icons-react"

export function UnderConstruction({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
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
