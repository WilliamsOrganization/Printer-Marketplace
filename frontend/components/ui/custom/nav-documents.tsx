"use client"

import * as React from "react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // "#" is a placeholder route - render it as visibly disabled
          // instead of a link that goes nowhere.
          const disabled = !item.url || item.url === "#"
          return (
            <SidebarMenuItem key={item.name}>
              {disabled ? (
                <SidebarMenuButton
                  tooltip="Coming soon"
                  className="cursor-not-allowed opacity-50"
                >
                  <item.icon className="size-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
