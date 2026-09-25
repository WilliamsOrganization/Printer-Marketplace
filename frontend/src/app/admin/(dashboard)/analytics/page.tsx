import { AnalyticsView } from "@/components/ui/custom/analytics-view"
import { DashboardOverview } from "@/components/ui/custom/dashboard-overview"

export const dynamic = "force-dynamic"

export default function AnalyticsPage() {
	return (
		<>
			<DashboardOverview />
			<AnalyticsView />
		</>
	)
}
