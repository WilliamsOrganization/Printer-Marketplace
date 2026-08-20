"use client";

import * as React from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type OnChangeFn,
	type SortingState,
	type Table as TanstackTable,
	type VisibilityState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableGrid, DataTableSimplePagination } from "@/components/ui/custom/data-table-grid";
import { OrderItemsDialog } from "./order-items-dialog";
import { OrderShippingDialog } from "./order-shipping-dialog";
import { OrderUserDialog } from "./order-user-dialog";
import { useDashboard } from "@/src/context/dashboard-context";
import { Orders as Order, OrderStatus, ShippingStatus } from "@/lib/types";

const STRIPE_ACCOUNT_ID = process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID;

const ORDER_STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[OrderStatus.PENDING]: "outline",
	[OrderStatus.COMPLETED]: "secondary",
	[OrderStatus.PAID]: "default",
	[OrderStatus.EXPIRED]: "destructive",
	[OrderStatus.FAILED]: "destructive",
};

// PAID first, COMPLETED second - the two statuses actually worth an admin's
// attention. PENDING/FAILED/EXPIRED are all equally low priority, so they're
// left tied rather than given an arbitrary order among themselves.
const ORDER_STATUS_PRIORITY: Record<OrderStatus, number> = {
	[OrderStatus.PAID]: 0,
	[OrderStatus.COMPLETED]: 1,
	[OrderStatus.PENDING]: 2,
	[OrderStatus.FAILED]: 2,
	[OrderStatus.EXPIRED]: 2,
};

// Not-yet-shipped orders need attention first; delivered ones don't.
const SHIPPING_STATUS_PRIORITY: Record<ShippingStatus, number> = {
	[ShippingStatus.PENDING]: 0,
	[ShippingStatus.PURCHASED]: 1,
	[ShippingStatus.IN_TRANSIT]: 2,
	[ShippingStatus.DELIVERED]: 3,
};
// An order somehow missing its shipping record sorts after DELIVERED -
// nothing actionable to do with it until that gets sorted out separately.
const MISSING_SHIPPING_PRIORITY = SHIPPING_STATUS_PRIORITY[ShippingStatus.DELIVERED] + 1;

const byPriority = (a: Order, b: Order) => ORDER_STATUS_PRIORITY[a.status] - ORDER_STATUS_PRIORITY[b.status];

const byShipping = (a: Order, b: Order) => {
	const aShipping = a.shipping ? SHIPPING_STATUS_PRIORITY[a.shipping.status] : MISSING_SHIPPING_PRIORITY;
	const bShipping = b.shipping ? SHIPPING_STATUS_PRIORITY[b.shipping.status] : MISSING_SHIPPING_PRIORITY;
	return aShipping - bShipping;
};

const byDateOldestFirst = (a: Order, b: Order) => new Date(a.date).getTime() - new Date(b.date).getTime();

export type OrderSortMode =
	| "default"
	| "date-oldest"
	| "date-newest"
	| "priority"
	| "priority-inverted"
	| "shipping"
	| "shipping-inverted";

export const ORDER_SORT_MODE_LABEL: Record<OrderSortMode, string> = {
	default: "Default",
	"date-oldest": "Oldest first",
	"date-newest": "Newest first",
	priority: "Priority (PAID, COMPLETED first)",
	"priority-inverted": "Priority (PAID, COMPLETED last)",
	shipping: "Shipping status (unshipped first)",
	"shipping-inverted": "Shipping status (delivered first)",
};

/**
 * Exactly one sort mode is ever active - a Radix radio group, not
 * independent toggles. "default" chains all three as successive tie-breaks
 * (priority, then shipping, then date), which surfaces the oldest PAID
 * order still awaiting shipment first; every other mode is a single
 * criterion, in one direction.
 */
function compareOrders(a: Order, b: Order, mode: OrderSortMode): number {
	switch (mode) {
		case "date-oldest":
			return byDateOldestFirst(a, b);
		case "date-newest":
			return byDateOldestFirst(b, a);
		case "priority":
			return byPriority(a, b);
		case "priority-inverted":
			return byPriority(b, a);
		case "shipping":
			return byShipping(a, b);
		case "shipping-inverted":
			return byShipping(b, a);
		default:
			return byPriority(a, b) || byShipping(a, b) || byDateOldestFirst(a, b);
	}
}

export function OrdersTable({
	globalFilter,
	columnVisibility,
	onColumnVisibilityChange,
	onTableChange,
	sortMode,
}: {
	globalFilter: string;
	columnVisibility: VisibilityState;
	onColumnVisibilityChange: OnChangeFn<VisibilityState>;
	onTableChange: (table: TanstackTable<Order>) => void;
	sortMode: OrderSortMode;
}) {
	const { orders } = useDashboard();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

	const sortedOrders = React.useMemo(
		() => [...orders].sort((a, b) => compareOrders(a, b, sortMode)),
		[orders, sortMode],
	);

	const columns: ColumnDef<Order>[] = [
		{
			accessorKey: "id",
			header: () => <div className="text-center">Order</div>,
			cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
		},
		{
			accessorKey: "date",
			header: () => <div className="text-center">Date</div>,
			cell: ({ row }) => (
				<div className="text-muted-foreground text-center">
					{row.original.date ? new Date(row.original.date).toLocaleDateString() : "—"}
				</div>
			),
		},
		{
			id: "email",
			accessorFn: (row) => [row.user?.email ?? row.email, row.user?.phoneNumber].filter(Boolean).join(" "),
			header: () => <div className="text-center">Customer</div>,
			cell: ({ row }) => <OrderUserDialog user={row.original.user} />,
		},
		{
			id: "cardholderName",
			accessorFn: (row) => row.cardholderName ?? "",
			header: () => <div className="text-center">Cardholder</div>,
			cell: ({ row }) => (
				<div className="text-center text-muted-foreground">
					{row.original.cardholderName ?? "—"}
				</div>
			),
		},
		{
			id: "items",
			accessorFn: (row) => row.items?.map((item) => item.itemTitle).join(" ") ?? "",
			header: () => <div className="text-center">Items</div>,
			cell: ({ row }) => (
				<div className="text-center">
					<OrderItemsDialog items={row.original.items} />
				</div>
			),
		},
		{
			accessorKey: "subtotal",
			header: () => <div className="text-center">Subtotal</div>,
			cell: ({ row }) => (
				<div className="text-center">
					${(row.original.subtotal / 100).toFixed(2)}
				</div>
			),
		},
		{
			accessorKey: "shippingCost",
			header: () => <div className="text-center">Shipping</div>,
			cell: ({ row }) => (
				<div className="text-center">
					${(row.original.shippingCost / 100).toFixed(2)}
				</div>
			),
		},
		{
			accessorKey: "total",
			header: () => <div className="text-center">Total</div>,
			cell: ({ row }) => (
				<div className="text-center font-medium">
					${(row.original.total / 100).toFixed(2)}{" "}
					<span className="text-muted-foreground text-xs uppercase">{row.original.currency}</span>
				</div>
			),
		},
		{
			accessorKey: "status",
			header: () => <div className="text-center">Status</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<Badge variant={ORDER_STATUS_VARIANT[row.original.status]} className="px-1.5">
						{row.original.status}
					</Badge>
				</div>
			),
		},
		{
			id: "shipping",
			header: () => <div className="text-center">Shipping</div>,
			cell: ({ row }) => (
				<OrderShippingDialog shipping={row.original.shipping} estimateCost={row.original.shippingCost} />
			),
		},
		{
			accessorKey: "stripeSessionId",
			header: () => <div className="text-center">Stripe</div>,
			cell: ({ row }) =>
				row.original.stripeSessionId ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href={`https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}/test/checkout/sessions/${row.original.stripeSessionId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-full w-full cursor-pointer items-center"
							>
								{row.original.stripeSessionId.slice(0, 14)}…
							</a>
						</TooltipTrigger>
						<TooltipContent>Open in Stripe Dashboard</TooltipContent>
					</Tooltip>
				) : (
					"—"
				),
		},
	];

	const table = useReactTable({
		data: sortedOrders,
		columns,
		state: { sorting, pagination, globalFilter, columnVisibility },
		getRowId: (row) => row.id.toString(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		// Pagination state is manually controlled above, so TanStack's default
		// of resetting to page 1 whenever the (sorted/filtered) data array gets
		// a new reference has to be turned off explicitly - otherwise toggling
		// a Sort checkbox silently jumps you back to page 1 every time.
		autoResetPageIndex: false,
		onColumnVisibilityChange,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	React.useEffect(() => {
		onTableChange(table);
	}, [table, onTableChange]);

	return (
		<div className="flex flex-col gap-4">
			<DataTableGrid table={table} emptyMessage="No orders yet." />
			<DataTableSimplePagination table={table} itemLabel="order" count={sortedOrders.length} />
		</div>
	);
}

export default OrdersTable;
