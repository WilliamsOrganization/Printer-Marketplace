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
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconDotsVertical,
	IconGripVertical,
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
	type OnChangeFn,
	type Row,
	type SortingState,
	type Table as TanstackTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

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
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryItemDialog } from "./inventory-item-dialog";
import ProductCard from "./product-card";
import api from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";
import { InventoryItem, SizeCategoryLabel, WeightCategoryLabel } from "@/lib/types";

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

function TableCellViewer({ item }: { item: InventoryItem }) {
	return (
		<Dialog>
			<div className="flex justify-center">
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							className="h-auto w-fit cursor-pointer justify-center rounded-full p-0 hover:bg-transparent"
						>
							<Badge variant="secondary" className="cursor-pointer px-6 transition-colors hover:bg-secondary/70">
								{item.itemTitle}
							</Badge>
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>Preview</TooltipContent>
			</Tooltip>
			</div>
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

export function InventoryTable({
	globalFilter,
	columnVisibility,
	onColumnVisibilityChange,
	onTableChange,
}: {
	globalFilter: string;
	columnVisibility: VisibilityState;
	onColumnVisibilityChange: OnChangeFn<VisibilityState>;
	onTableChange: (table: TanstackTable<InventoryItem>) => void;
}) {
	const { inventory: initialData, setInventory } = useDashboard();
	const [data, setData] = React.useState(() => [...initialData].sort((a, b) => b.id - a.id));
	React.useEffect(() => {
		setData([...initialData].sort((a, b) => b.id - a.id));
	}, [initialData]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
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
			header: () => <div className="text-center">Item Preview</div>,
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
			accessorKey: "quantity",
			header: () => <div className="text-center">Stock</div>,
			cell: ({ row }) => (
				<div className={`text-center font-medium ${row.original.quantity === 0 ? "text-destructive" : ""}`}>
					{row.original.quantity}
				</div>
			),
		},
		{
			id: "sizeCategory",
			accessorFn: (row) => SizeCategoryLabel[row.sizeCategory],
			header: () => <div className="text-center">Size</div>,
			cell: ({ row }) => (
				<div className="text-center text-muted-foreground">
					{SizeCategoryLabel[row.original.sizeCategory]}
				</div>
			),
		},
		{
			id: "weightCategory",
			accessorFn: (row) => WeightCategoryLabel[row.weightCategory],
			header: () => <div className="text-center">Weight</div>,
			cell: ({ row }) => (
				<div className="text-center text-muted-foreground">
					{WeightCategoryLabel[row.original.weightCategory]}
				</div>
			),
		},
		{
			id: "sale",
			accessorFn: (row) => (row.sale ? "On Sale" : ""),
			header: () => <div className="text-center">Sale</div>,
			cell: ({ row }) =>
				row.original.sale ? (
					<div className="flex justify-center">
						<Badge variant="default">On Sale</Badge>
					</div>
				) : (
					<div className="text-center text-muted-foreground">—</div>
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
		onColumnVisibilityChange,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	React.useEffect(() => {
		onTableChange(table);
	}, [table, onTableChange]);

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

	return (
		<div className="relative flex flex-col gap-4 overflow-auto">
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
		</div>
	);
}

export default InventoryTable;
