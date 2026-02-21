"use client"

import { AppSidebar } from "@/components/ui/app-sidebar"
import { ChartAreaInteractive } from "@/components/ui/chart-area-interactive"
import { DataTable } from "@/components/ui/data-table"
import { SectionCards } from "@/components/ui/section-cards"
import { SiteHeader } from "@/components/ui/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { InventoryItem } from "@/lib/types"

export default function Dashboard() {
	const [inventory, setInventory] = useState<InventoryItem[]>([]);

	useEffect(() => {
		api
			.get("/inventoryitem")
			.then((res) => {
				setInventory(res.data);
			})
			.catch((err) => {
				console.log("Error" + err.message);
			});
	}, []);

  return (
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
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={inventory} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

