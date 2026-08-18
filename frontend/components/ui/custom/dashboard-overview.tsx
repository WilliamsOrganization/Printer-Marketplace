import { ChartAreaInteractive } from "@/components/ui/custom/chart-area-interactive"
import { SectionCards } from "@/components/ui/custom/section-cards"

/**
 * Stat cards + sessions chart shared between the dashboard home page and
 * the analytics page, so both stay in sync with a single component instead
 * of two copies drifting apart.
 */
export function DashboardOverview() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </>
  )
}
