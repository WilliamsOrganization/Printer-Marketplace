"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import { formatDateTick } from "./chart-formatters"

const usersChartConfig = {
  signups: { label: "New Registrations", color: "var(--chart-2)" },
} satisfies ChartConfig

export function UsersChart({ data }: { data: { date: string; signups: number }[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Registered Users Over Time</CardTitle>
        <CardDescription>New account registrations by day</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={usersChartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-signups)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-signups)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatDateTick}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={formatDateTick} indicator="dot" />}
            />
            <Area
              dataKey="signups"
              type="natural"
              fill="url(#fillSignups)"
              stroke="var(--color-signups)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
