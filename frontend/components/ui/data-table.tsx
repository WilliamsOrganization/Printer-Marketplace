"use client";

import * as React from "react";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconGripVertical,
	IconLayoutColumns,
	IconPlus,
} from "@tabler/icons-react";
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type Row,
	type SortingState,
	type Table as TanstackTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryItemDialog } from "./custom/inventory-item-dialog";
import ProductCard from "./custom/product-card";
import { OrderUserDialog } from "./custom/order-user-dialog";
import { OrderItemsDialog } from "./custom/order-items-dialog";
import { OrderShippingDialog } from "./custom/order-shipping-dialog";
import api from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";
import { InventoryItem, Orders as Order, OrderStatus } from "@/lib/types";

export const schema = z.object({
	id: z.number(),
	itemTitle: z.string(),
	itemDescription: z.string(),
	itemCost: z.number(),
	createdAt: z.string().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
	const { attributes, listeners } = useSortable({
		id,
	});

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent"
		>
			<IconGripVertical className="text-muted-foreground size-3" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	);
}

function DraggableRow({ row }: { row: Row<InventoryItem> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	);
}

// Renders the edit Dialog as a sibling of the DropdownMenu, controlled via
// its own state, instead of nesting it inside a DropdownMenuItem - Radix
// leaves `pointer-events: none` stuck on <body> after a Dialog opened from
// inside a DropdownMenuItem closes its menu, which silently breaks
// interactions (including drag-and-drop) inside that Dialog.
function InventoryRowActions({
	item,
	onDelete,
}: {
	item: InventoryItem;
	onDelete: (id: number) => void;
}) {
	const [editOpen, setEditOpen] = React.useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
						size="icon"
					>
						<IconDotsVertical />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem onSelect={() => setEditOpen(true)}>
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a
							href={`https://dashboard.stripe.com/${process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID}/test/products/${item.stripeProductId}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							View in Stripe
						</a>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => onDelete(item.id)}
					>
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<InventoryItemDialog item={item} open={editOpen} onOpenChange={setEditOpen} />
		</>
	);
}

function ColumnVisibilityDropdown({ table }: { table: TanstackTable<any> | null }) {
	if (!table) return null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<IconLayoutColumns />
					<span className="hidden lg:inline">Customize Columns</span>
					<span className="lg:hidden">Columns</span>
					<IconChevronDown />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				{table
					.getAllColumns()
					.filter(
						(column) =>
							typeof column.accessorFn !== "undefined" &&
							column.getCanHide(),
					)
					.map((column) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="capitalize"
								checked={column.getIsVisible()}
								onCheckedChange={(value) =>
									column.toggleVisibility(!!value)
								}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function DataTable() {
	const [activeTab, setActiveTab] = React.useState("inventory");
	const { inventory: initialData, setInventory, orders } = useDashboard();
	const [ordersSorting, setOrdersSorting] = React.useState<SortingState>([]);
	const [ordersColumnVisibility, setOrdersColumnVisibility] = React.useState<VisibilityState>({});
	const [ordersPagination, setOrdersPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [data, setData] = React.useState(() => [...initialData].sort((a, b) => b.id - a.id));
	React.useEffect(() => {
		setData([...initialData].sort((a, b) => b.id - a.id));
	}, [initialData]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState("");
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
		useSensor(KeyboardSensor, {}),
	);

	const deleteInventoryItem = function(id: number) {
		api
			.delete(`/inventoryitem/${id}`)
			.then((res) => {
				if (res.data === "archived") {
					toast.warning("Item has prior orders and could not be fully deleted — it has been archived in Stripe.");
				} else {
					toast.success("Successfully deleted inventory item");
				}
				setInventory((prev) => prev.filter((item) => item.id !== id));
			})
			.catch((err) => {
				console.log("Error occured here: " + err.message);
				toast.error("Error deleting inventory item: " + err.message);
			});
	};

	const toggleArchived = function(id: number, archived: boolean) {
		api
			.post(`/inventoryitem/${id}/archive`, archived)
			.then((res) => {
				setInventory((prev) =>
					prev.map((item) => (item.id === id ? res.data : item)),

				);
				toast.success("Successfully updated inventory item");
			})
			.catch((err) => {
				toast.error("Error updating archived state: " + err.message);
			});
	};

	const columns: ColumnDef<InventoryItem>[] = [
		{
			id: "drag",
			header: () => null,
			cell: ({ row }) => <DragHandle id={row.original.id} />,
		},
		{
			id: "select",
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
						aria-label="Select all"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						onCheckedChange={(value) => row.toggleSelected(!!value)}
						aria-label="Select row"
					/>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "itemTitle",
			header: () => <div className="text-center">Item Title</div>,
			cell: ({ row }) => {
				return <TableCellViewer item={row.original} />;
			},
			enableHiding: false,
		},
		{
			accessorKey: "itemDescription",
			header: () => <div className="text-center">Description</div>,
			cell: ({ row }) => (
				<div className="max-w-48 truncate text-muted-foreground">
					{row.original.itemDescription}
				</div>
			),
		},
		{
			accessorKey: "itemCost",
			header: () => <div className="text-center">Price</div>,
			cell: ({ row }) => (
				<div className="text-center font-medium">
					${row.original.itemCost.toFixed(2)}
				</div>
			),
		},
		{
			accessorKey: "isArchived",
			header: () => <div className="text-center">Archived</div>,
			cell: ({ row }) => (
				<div className="flex justify-center">
					<Switch
						checked={row.original.isArchived}
						onCheckedChange={(checked) => toggleArchived(row.original.id, checked)}
						aria-label="Toggle archived"
					/>
				</div>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<InventoryRowActions item={row.original} onDelete={deleteInventoryItem} />
			),
		},
	];

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map(({ id }) => id) || [],
		[data],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
			globalFilter,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData((data) => {
				const oldIndex = data.findIndex((item) => item.id === active.id);
				const newIndex = data.findIndex((item) => item.id === over.id);
				if (oldIndex === -1 || newIndex === -1) return data;
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	const ordersColumns: ColumnDef<Order>[] = [
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
			cell: ({ row }) => <OrderShippingDialog shipping={row.original.shipping} />,
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

	const ordersTable = useReactTable({
		data: orders,
		columns: ordersColumns,
		state: { sorting: ordersSorting, pagination: ordersPagination, globalFilter, columnVisibility: ordersColumnVisibility },
		getRowId: (row) => row.id.toString(),
		onSortingChange: setOrdersSorting,
		onPaginationChange: setOrdersPagination,
		onGlobalFilterChange: setGlobalFilter,
		onColumnVisibilityChange: setOrdersColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const activeTable = activeTab === "inventory" ? table : activeTab === "orders" ? ordersTable : null;

	return (
		<Tabs
			value={activeTab}
			onValueChange={setActiveTab}
			className="w-full flex-col justify-start gap-6"
		>
			<div className="flex items-center justify-between px-4 lg:px-6">
				<Label htmlFor="view-selector" className="sr-only">
					View
				</Label>
				<Select value={activeTab} onValueChange={setActiveTab}>
					<SelectTrigger
						className="flex w-fit @4xl/main:hidden"
						size="sm"
						id="view-selector"
					>
						<SelectValue placeholder="Select a view" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="inventory">Inventory Items</SelectItem>
						<SelectItem value="orders">Orders</SelectItem>
						<SelectItem value="shipping">Shipping</SelectItem>
						<SelectItem value="returns">Returns</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="inventory">Inventory Items</TabsTrigger>
					<TabsTrigger value="orders">Orders</TabsTrigger>
					<TabsTrigger value="shipping">Shipping</TabsTrigger>
					<TabsTrigger value="returns">Returns</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Search…"
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="h-8 w-40 lg:w-56"
					/>
					<ColumnVisibilityDropdown table={activeTable} />
					<Button variant="outline" size="sm">
						<IconPlus />
						<span className="hidden lg:inline">Add Section</span>
					</Button>
				</div>
			</div>
			<TabsContent
				value="inventory"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<TableHeader className="bg-muted sticky top-0 z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id} colSpan={header.colSpan}>
													{header.isPlaceholder
														? null
														: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className="**:data-[slot=table-cell]:first:w-8">
								{table.getRowModel().rows?.length ? (
									<SortableContext
										items={dataIds}
										strategy={verticalListSortingStrategy}
									>
										{table.getRowModel().rows.map((row) => (
											<DraggableRow key={row.id} row={row} />
										))}
									</SortableContext>
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</DndContext>
				</div>
				<div className="flex items-center justify-between px-4">
					<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight />
							</Button>
							<Button
								variant="outline"
								className="hidden size-8 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent
				value="orders"
				className="flex flex-col px-4 lg:px-6"
			>
				<OrdersTable table={ordersTable} orders={orders} />
			</TabsContent>
			<TabsContent value="shipping" className="flex flex-col px-4 lg:px-6">
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
			</TabsContent>
			<TabsContent
				value="returns"
				className="flex flex-col px-4 lg:px-6"
			>
				<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
			</TabsContent>
		</Tabs>
	);
}

const STRIPE_ACCOUNT_ID = process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID;

const ORDER_STATUS_VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
	[OrderStatus.PENDING]: "outline",
	[OrderStatus.COMPLETED]: "secondary",
	[OrderStatus.PAID]: "default",
	[OrderStatus.EXPIRED]: "destructive",
	[OrderStatus.FAILED]: "destructive",
};

function OrdersTable({
	table,
	orders,
}: {
	table: TanstackTable<Order>;
	orders: Order[];
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader className="bg-muted sticky top-0 z-10">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
									No orders yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between px-1">
				<div className="text-muted-foreground text-sm">
					{table.getFilteredRowModel().rows.length} of {orders.length} order{orders.length === 1 ? "" : "s"}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<IconChevronLeft />
					</Button>
					<div className="text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
					</div>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<IconChevronRight />
					</Button>
				</div>
			</div>
		</div>
	);
}

function TableCellViewer({ item }: { item: InventoryItem }) {
	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="text-foreground h-full w-full cursor-pointer justify-start rounded-none font-normal"
						>
							{item.itemTitle}
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Preview</TooltipContent>
			</Tooltip>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="gap-1">
					<DialogTitle>{item.itemTitle}</DialogTitle>
					<DialogDescription>
						${item.itemCost.toFixed(2)}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 overflow-y-auto text-sm">
					<ProductCard products={[item]} gridClassName="grid-cols-1 sm:grid-cols-1 lg:grid-cols-1" />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
