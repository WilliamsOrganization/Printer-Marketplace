"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const popularItemsChartConfig = {
  quantity: { label: "Units Sold", color: "var(--chart-3)" },
} satisfies ChartConfig

export function PopularItemsChart({ data }: { data: { itemTitle: string; quantity: number }[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Popular Cart Items</CardTitle>
        <CardDescription>Top items by units sold across all orders</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={popularItemsChartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" dataKey="quantity" tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="itemTitle"
              tickLine={false}
              axisLine={false}
              width={120}
              tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 16)}…` : value)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="quantity" fill="var(--color-quantity)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
