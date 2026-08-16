"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useDashboard } from "@/src/context/dashboard-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDateTick(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
        <CardDescription>From completed and paid orders</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={revenueChartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
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
              content={
                <ChartTooltipContent
                  labelFormatter={formatDateTick}
                  formatter={(value) => [`$${value}`, " Revenue"]}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const ordersChartConfig = {
  orders: { label: "Total Orders", color: "var(--chart-1)" },
  completed: { label: "Completed", color: "var(--chart-2)" },
} satisfies ChartConfig

function OrdersChart({ data }: { data: { date: string; orders: number; completed: number }[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Orders & Completed Checkouts</CardTitle>
        <CardDescription>Total orders placed vs. successfully completed</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={ordersChartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data}>
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
            <Bar dataKey="orders" fill="var(--color-orders)" radius={4} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const usersChartConfig = {
  signups: { label: "New Registrations", color: "var(--chart-2)" },
} satisfies ChartConfig

function UsersChart({ data }: { data: { date: string; signups: number }[] }) {
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

const popularItemsChartConfig = {
  quantity: { label: "Units Sold", color: "var(--chart-3)" },
} satisfies ChartConfig

function PopularItemsChart({ data }: { data: { itemTitle: string; quantity: number }[] }) {
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

export function AnalyticsView() {
  const { analytics } = useDashboard()

  const totalRevenue = analytics?.totalRevenueCents ?? 0
  const successfulOrderCount = analytics?.successfulOrderCount ?? 0
  const totalOrderCount = analytics?.totalOrderCount ?? 0
  const registeredUserCount = analytics?.registeredUserCount ?? 0
  const totalAccounts = analytics?.totalAccounts ?? 0
  const repeatPurchaseRate = analytics?.repeatPurchaseRatePercent ?? 0

  const revenueChartData = React.useMemo(
    () => (analytics?.revenueByDate ?? []).map((metric) => ({ date: metric.date, revenue: metric.value / 100 })),
    [analytics],
  )

  const ordersChartData = React.useMemo(
    () =>
      (analytics?.ordersByDate ?? []).map((metric) => ({
        date: metric.date,
        orders: metric.totalOrders,
        completed: metric.completedOrders,
      })),
    [analytics],
  )

  const usersChartData = React.useMemo(
    () => (analytics?.registeredUsersByDate ?? []).map((metric) => ({ date: metric.date, signups: metric.value })),
    [analytics],
  )

  const popularItemsData = analytics?.popularItems ?? []

  return (
    <>
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            From {successfulOrderCount} successful order{successfulOrderCount === 1 ? "" : "s"}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Completed Checkouts</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {successfulOrderCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Out of {totalOrderCount} total order{totalOrderCount === 1 ? "" : "s"}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Registered Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {registeredUserCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Out of {totalAccounts} total account{totalAccounts === 1 ? "" : "s"}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Repeat Purchase Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {repeatPurchaseRate}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Customers with more than one order
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <RevenueChart data={revenueChartData} />
        <OrdersChart data={ordersChartData} />
        <UsersChart data={usersChartData} />
        <PopularItemsChart data={popularItemsData} />
      </div>
    </>
  )
}
