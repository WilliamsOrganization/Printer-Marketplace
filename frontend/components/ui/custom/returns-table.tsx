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
import { ChatWithUserDialog } from "./chat-with-user-dialog";
import { ReturnReviewedToggle } from "./return-reviewed-toggle";
import { useDashboard } from "@/src/context/dashboard-context";
import { Returns, ReturnStatus } from "@/lib/types";

const STRIPE_ACCOUNT_ID = process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID;

const RETURN_STATUS_VARIANT: Record<ReturnStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[ReturnStatus.PENDING]: "secondary",
	[ReturnStatus.REFUNDED]: "default",
	[ReturnStatus.CANCELLED]: "destructive",
};

export function ReturnsTable({
	globalFilter,
	columnVisibility,
	onColumnVisibilityChange,
	onTableChange,
}: {
	globalFilter: string;
	columnVisibility: VisibilityState;
	onColumnVisibilityChange: OnChangeFn<VisibilityState>;
	onTableChange: (table: TanstackTable<Returns>) => void;
}) {
	const { returns } = useDashboard();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
	

	const columns: ColumnDef<Returns>[] = [
		{
			accessorKey: "id",
			header: () => <div className="text-center">Return</div>,
			cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
		},
		{
			accessorKey: "requestedDate",
			header: () => <div className="text-center">Requested</div>,
			cell: ({ row }) => (
				<div className="text-muted-foreground text-center">
					{row.original.requestedDate ? new Date(row.original.requestedDate).toLocaleDateString() : "—"}
				</div>
			),
		},
		{
			id: "order",
			accessorFn: (row) => row.orderId ?? "",
			header: () => <div className="text-center">Order</div>,
			cell: ({ row }) =>
				row.original.orderStripeSessionId ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href={`https://dashboard.stripe.com/${STRIPE_ACCOUNT_ID}/test/checkout/sessions/${row.original.orderStripeSessionId}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground hover:text-foreground hover:bg-muted flex h-full w-full cursor-pointer items-center justify-center font-medium"
							>
								#{row.original.orderId}
							</a>
						</TooltipTrigger>
						<TooltipContent>Open order in Stripe Dashboard</TooltipContent>
					</Tooltip>
				) : (
					<div className="text-center font-medium">#{row.original.orderId}</div>
				),
		},
		{
			id: "items",
			accessorFn: (row) => row.itemsToReturn?.map((item) => item.itemTitle).join(" ") ?? "",
			header: () => <div className="text-center">Items</div>,
			cell: ({ row }) => (
				<div className="text-center">
					<OrderItemsDialog
						items={row.original.itemsToReturn}
						title="Return Items"
						description="Line items requested for return."
						tooltip="View return items"
						emptyMessage="No items on this return."
					/>
				</div>
			),
		},
		{
			accessorKey: "reasonForReturn",
			header: () => <div className="text-center">Reason</div>,
			cell: ({ row }) => (
				<div className="max-w-48 truncate text-muted-foreground">
					{row.original.reasonForReturn}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: () => <div className="text-center">Status</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<Badge variant={RETURN_STATUS_VARIANT[row.original.status]} className="px-1.5">
						{row.original.status}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "refundedAmount",
			header: () => <div className="text-center">Refunded</div>,
			cell: ({ row }) => (
				<div className="text-center font-medium">
					{row.original.refundedAmount != null ? `$${(row.original.refundedAmount / 100).toFixed(2)}` : "—"}
				</div>
			),
		},
		{
			accessorKey: "refundedAt",
			header: () => <div className="text-center">Refunded At</div>,
			cell: ({ row }) => (
				<div className="text-muted-foreground text-center">
					{row.original.refundedAt ? new Date(row.original.refundedAt).toLocaleDateString() : "—"}
				</div>
			),
		},
		{
			accessorKey: "reviewed",
			header: () => <div className="text-center">Reviewed</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<ReturnReviewedToggle reviewed={row.original.reviewed} returnId={row.original.id} />
				</div>
			),
		},
		{
			id: "chat",
			header: () => <div className="text-center">Chat</div>,
			cell: () => (
				<div className="flex justify-center">
					<ChatWithUserDialog />
				</div>
			),
			enableHiding: false,
		},
	];

	const table = useReactTable({
		data: returns,
		columns,
		state: { sorting, pagination, globalFilter, columnVisibility },
		getRowId: (row) => row.id.toString(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		// Pagination state is manually controlled above - see shipments-table.tsx
		// for why this needs to be explicit.
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
			<DataTableGrid table={table} emptyMessage="No returns yet." />
			<DataTableSimplePagination table={table} itemLabel="return" count={returns.length} />
		</div>
	);
}

export default ReturnsTable;
