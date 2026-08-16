"use client"

import * as React from "react"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { AnalyticsView } from "@/components/ui/analytics-view"
import { DashboardOverview } from "@/components/ui/dashboard-overview"
import { DataTable } from "@/components/ui/data-table"
import { SiteHeader } from "@/components/ui/site-header"
import { UnderConstruction } from "@/components/ui/under-construction"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { DashboardProvider } from "@/src/context/dashboard-context"

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  lifecycle: "Lifecycle",
  projects: "Projects",
  team: "Team",
}

export default function Dashboard() {
  const [activeView, setActiveView] = React.useState("dashboard")

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
        <AppSidebar variant="inset" activeView={activeView} onSelectView={setActiveView} />
        <SidebarInset>
          <SiteHeader title={VIEW_TITLES[activeView]} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {(activeView === "dashboard" || activeView === "analytics") && <DashboardOverview />}
                {activeView === "analytics" && <AnalyticsView />}
                {activeView !== "dashboard" && activeView !== "analytics" && (
                  <UnderConstruction title={VIEW_TITLES[activeView]} />
                )}
                {/* Shared across every non-analytics view so it's already wired up
                    once lifecycle/shipping and friends get built out for real. */}
                {activeView !== "analytics" && <DataTable />}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  )
}
