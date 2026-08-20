"use client"

import * as React from "react"

import { useDashboard } from "@/src/context/dashboard-context"
import { ShippingStatus } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RevenueChart } from "./revenue-chart"
import { OrdersChart } from "./orders-chart"
import { UsersChart } from "./users-chart"
import { PopularItemsChart } from "./popular-items-chart"

export function AnalyticsView() {
  const { analytics, orders, inventory } = useDashboard()

  const totalRevenue = analytics?.totalRevenueCents ?? 0
  const successfulOrderCount = analytics?.successfulOrderCount ?? 0
  const totalOrderCount = analytics?.totalOrderCount ?? 0
  const registeredUserCount = analytics?.registeredUserCount ?? 0
  const totalAccounts = analytics?.totalAccounts ?? 0
  const repeatPurchaseRate = analytics?.repeatPurchaseRatePercent ?? 0

  // Everything below is computed straight from what's already loaded
  // (orders/inventory), no extra backend calls - these aren't in
  // DashboardAnalyticsResponse.
  const avgOrderValue = orders.length
    ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
    : 0

  const shippedOrders = orders.filter((order) => order.shipping != null)
  const ordersNeedingLabel = shippedOrders.filter((order) => !order.shipping!.trackingNumber).length
  const inTransitCount = shippedOrders.filter(
    (order) => order.shipping!.status === ShippingStatus.IN_TRANSIT,
  ).length

  const quotedVsActual = shippedOrders.filter((order) => order.shipping!.actualShippingCost != null)
  const avgShippingVariance = quotedVsActual.length
    ? quotedVsActual.reduce(
        (sum, order) => sum + (order.shipping!.actualShippingCost! - order.shippingCost),
        0,
      ) / quotedVsActual.length
    : null

  const LOW_STOCK_THRESHOLD = 5
  const lowStockCount = inventory.filter(
    (item) => !item.isArchived && item.quantity < LOW_STOCK_THRESHOLD,
  ).length

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

      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Average Order Value</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatCurrency(avgOrderValue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Across {orders.length} order{orders.length === 1 ? "" : "s"}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Shipping Cost Accuracy</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {avgShippingVariance == null
                ? "—"
                : `${avgShippingVariance >= 0 ? "+" : "-"}${formatCurrency(Math.abs(avgShippingVariance))}`}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            {avgShippingVariance == null
              ? "No labels purchased yet"
              : `Avg. actual vs. quoted, over ${quotedVsActual.length} label${quotedVsActual.length === 1 ? "" : "s"}`}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Orders Needing a Label</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {ordersNeedingLabel}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Out of {shippedOrders.length} shipped order{shippedOrders.length === 1 ? "" : "s"}
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>In Transit</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {inTransitCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Shipment{inTransitCount === 1 ? "" : "s"} currently on the way
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Low Stock Items</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {lowStockCount}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Active items under {LOW_STOCK_THRESHOLD} units in stock
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
