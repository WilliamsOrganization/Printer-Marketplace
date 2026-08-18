"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InventoryItemDialog } from "./inventory-item-dialog";
import { useDashboard } from "@/src/context/dashboard-context";

export function SectionCards() {
	const { analytics, sessionCount, activeSessionCount, uniqueUserCount, growthRate } = useDashboard();
	const archivedCount = analytics?.inventoryArchivedCount ?? 0;
	const activeCount = analytics?.inventoryActiveCount ?? 0;
	const totalAccounts = analytics?.totalAccounts ?? 0;
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{/* this is the important card I want to actually mess with */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Inventory Items</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						<div className="flex justify-between w-full px-2">
							<div className="flex flex-col">
								<span>{activeCount}</span>
								<span className="text-sm font-normal text-muted-foreground">Active</span>
							</div>
							<div className="flex flex-col">
								<span>{archivedCount}</span>
								<span className="text-sm font-normal text-muted-foreground">Archived</span>
							</div>
						</div>
					</CardTitle>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<InventoryItemDialog
						trigger={<Button className="min-w-full" variant="outline">Create Inventory Item</Button>}
					/>
				</CardFooter>
			</Card>

			{/* Session Stats Card */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Session Stats</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{activeSessionCount} <span className="text-muted-foreground text-lg">active</span>
					</CardTitle>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="flex gap-2">
						<span className="font-medium">{sessionCount}</span>
						<span >Total Sessions</span>
					</div>
					<div className="flex gap-2">
						<span className="font-medium">{uniqueUserCount}</span>
						<span className="text-muted-foreground">Unique Users</span>
					</div>
				</CardFooter>

			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Active Accounts</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{totalAccounts}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Strong user retention <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">Engagement exceed targets</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Session Growth Rate</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{growthRate === null ? "—" : `${growthRate}%`}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							{growthRate !== null && growthRate >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
							{growthRate === null ? "—" : `${growthRate >= 0 ? "+" : ""}${growthRate}%`}
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						{growthRate !== null && growthRate >= 0 ? "Sessions up from last month" : "Sessions down from last month"}
						{growthRate !== null && growthRate >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
					</div>
					<div className="text-muted-foreground">Month over month</div>
				</CardFooter>
			</Card>
		</div>
	);
}
