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
import { Button } from "./button";
import Link from "next/link";
import { useDashboard } from "@/src/context/dashboard-context";

export function SectionCards() {
	const { inventory, users, sessionCount, activeSessionCount, uniqueUserCount } = useDashboard();
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{/* this is the important card I want to actually mess with */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Inventory Items</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{inventory.length}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-row text-md min-w-full ">
						<Link href="/admin/dashboard/item/" className="min-w-full">
							<Button className="min-w-full" variant="outline">Create Inventory item</Button>
						</Link>
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
						{users.length}
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
					<CardDescription>Growth Rate</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						4.5%
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+4.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Steady performance increase <IconTrendingUp className="size-4" />
					</div>
					<div className="text-muted-foreground">Meets growth projections</div>
				</CardFooter>
			</Card>
		</div>
	);
}
