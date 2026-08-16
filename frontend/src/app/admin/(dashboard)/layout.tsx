"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SiteHeader } from "@/components/ui/site-header"
import {
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardProvider } from "@/src/context/dashboard-context"

const PAGE_TITLES: Record<string, string> = {
	"/admin/dashboard": "Dashboard",
	"/admin/analytics": "Analytics",
	"/admin/shipments": "Shipments",
	"/admin/users": "Users",
	"/admin/team": "Team",
}

/**
 * Shared shell (sidebar + header + dashboard data) for every admin page
 * that lives behind it. Each route under this layout is a real page, so
 * navigating between them is a genuine browser navigation - the sidebar
 * itself stays mounted since only `children` swaps.
 */
export default function DashboardShellLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname()
	const title = PAGE_TITLES[pathname] ?? "Dashboard"

	return (
		<DashboardProvider>
			<SidebarProvider
				style={
					{
						"--sidebar-width": "calc(var(--spacing) * 72)",
						"--header-height": "calc(var(--spacing) * 12)",
					} as React.CSSProperties
				}
			>
				<AppSidebar variant="inset" />
				<SidebarInset>
					<SiteHeader title={title} />
					<div className="flex flex-1 flex-col">
						<div className="@container/main flex flex-1 flex-col gap-2">
							<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
								{children}
							</div>
						</div>
					</div>
				</SidebarInset>
			</SidebarProvider>
		</DashboardProvider>
	)
}
