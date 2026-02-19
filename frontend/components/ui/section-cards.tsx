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
import { useEffect, useState } from "react";
import { InventoryItem, User } from "@/lib/types";
import axios from "axios";
import { Button } from "./button";
import Link from "next/link";

export function SectionCards() {
	const [inventory, inventoryState] = useState<InventoryItem[] | null>(null);
	const [inventoryCount, inventoryCountState] = useState<number>(0);

	const [user, userState] = useState<User[] | null>(null);
	const [userCount, userCountState] = useState<number>(0);
	useEffect(() => {
		axios
			.get("/server/inventoryitem")
			.then((res) => {
				inventoryState(res.data);
				inventoryCountState(res.data.length);
			})
			.catch((err) => {
				console.log("Error" + err.message);
			});

		axios
			.get("/server/users")
			.then((res) => {
				userState(res.data);
				userCountState(res.data.length);
			})
			.catch((err) => {
				console.log("Error" + err.message);
			});

	}, []);

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
			{/* this is the important card I want to actually mess with */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Inventory Items</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{inventoryCount}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col text-md min-w-full">
					<Link href="/admin/item/" >
						<Button className="w-full" variant="outline">Create Inventory Item</Button>
					</Link>
				</CardFooter>
			</Card>

			{/* this is the important card I want to actually mess with */}
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Active Users</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{userCount}
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingDown />
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Down 20% this period <IconTrendingDown className="size-4" />
					</div>
					<div className="text-muted-foreground">
						Total Accounts Registered
					</div>
				</CardFooter>
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Active Accounts</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						45,678
					</CardTitle>
					<CardAction>
						<Badge variant="outline">
							<IconTrendingUp />
							+12.5%
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
