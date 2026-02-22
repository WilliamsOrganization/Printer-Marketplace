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
	IconCircleCheckFilled,
	IconDotsVertical,
	IconGripVertical,
	IconLayoutColumns,
	IconLoader,
	IconPlus,
	IconTrendingUp,
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
	type VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
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
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditInventory from "./custom/dialog-popup-edit";
import api from "@/lib/api";
import { useDashboard } from "@/src/context/dashboard-context";
import { InventoryItem } from "@/lib/types";

export const schema = z.object({
	id: z.number(),
	itemTitle: z.string(),
	itemDescription: z.string(),
	itemCost: z.number(),
	category: z.string(),
	badge: z.string().nullable().optional(),
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

export function DataTable() {
	const { inventory: initialData, setInventory } = useDashboard();
	const [data, setData] = React.useState(() => initialData);
	React.useEffect(() => {
		setData(initialData);
	}, [initialData]);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {}),
	);

	const deleteInventoryItem = function(id: number) {
		api.delete(`/inventoryitem/${id}`).then((res) => {
			console.log("successfully deleted item" + res.data)
			toast.success("Successfully deleted inventory item")
			setData(prev => prev.filter(item=>item.id !==id))
		}).catch((err) => {
			console.log("Error occured here: " + err.message)
			toast.success("Error deleting inventory item: "+ err.message)
		})
	}

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
						onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
			header: "Item Title",
			cell: ({ row }) => {
				return <TableCellViewer item={row.original} />;
			},
			enableHiding: false,
		},
		{
			accessorKey: "itemDescription",
			header: "Description",
			cell: ({ row }) => (
				<div className="max-w-48 truncate text-muted-foreground">
					{row.original.itemDescription}
				</div>
			),
		},
		{
			accessorKey: "itemCost",
			header: () => <div className="w-full text-right">Price</div>,
			cell: ({ row }) => (
				<div className="text-right font-medium">
					${row.original.itemCost.toFixed(2)}
				</div>
			),
		},
		{
			accessorKey: "category",
			header: "Category",
			cell: ({ row }) => (
				<div className="w-32">
					<Badge variant="outline" className="text-muted-foreground px-1.5">
						{row.original.category}
					</Badge>
				</div>
			),
		},
		{
			accessorKey: "badge",
			header: "Badge",
			cell: ({ row }) =>
				row.original.badge ? (
					<Badge variant="secondary" className="px-1.5">
						{row.original.badge}
					</Badge>
				) : null,
		},
		{
			id: "actions",
			cell: ({ row }) => (
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
					<DropdownMenuContent align="end" className="w-32">
						<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
							<EditInventory item={row.original} />
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							variant="destructive"
							onSelect={() => deleteInventoryItem(row.original.id)}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	]

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
	},
	getRowId: (row) => row.id.toString(),
	enableRowSelection: true,
	onRowSelectionChange: setRowSelection,
	onSortingChange: setSorting,
	onColumnFiltersChange: setColumnFilters,
	onColumnVisibilityChange: setColumnVisibility,
	onPaginationChange: setPagination,
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
			const oldIndex = dataIds.indexOf(active.id);
			const newIndex = dataIds.indexOf(over.id);
			return arrayMove(data, oldIndex, newIndex);
		});
	}
}

return (
	<Tabs
		defaultValue="outline"
		className="w-full flex-col justify-start gap-6"
	>
		<div className="flex items-center justify-between px-4 lg:px-6">
			<Label htmlFor="view-selector" className="sr-only">
				View
			</Label>
			<Select defaultValue="outline">
				<SelectTrigger
					className="flex w-fit @4xl/main:hidden"
					size="sm"
					id="view-selector"
				>
					<SelectValue placeholder="Select a view" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="outline">Outline</SelectItem>
					<SelectItem value="past-performance">Past Performance</SelectItem>
					<SelectItem value="key-personnel">Key Personnel</SelectItem>
					<SelectItem value="focus-documents">Focus Documents</SelectItem>
				</SelectContent>
			</Select>
			<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
				<TabsTrigger value="outline">Outline</TabsTrigger>
				<TabsTrigger value="past-performance">
					Past Performance <Badge variant="secondary">3</Badge>
				</TabsTrigger>
				<TabsTrigger value="key-personnel">
					Key Personnel <Badge variant="secondary">2</Badge>
				</TabsTrigger>
				<TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
			</TabsList>
			<div className="flex items-center gap-2">
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
				<Button variant="outline" size="sm">
					<IconPlus />
					<span className="hidden lg:inline">Add Section</span>
				</Button>
			</div>
		</div>
		<TabsContent
			value="outline"
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
			value="past-performance"
			className="flex flex-col px-4 lg:px-6"
		>
			<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
		</TabsContent>
		<TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
			<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
		</TabsContent>
		<TabsContent
			value="focus-documents"
			className="flex flex-col px-4 lg:px-6"
		>
			<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
		</TabsContent>
	</Tabs>
);
}

const chartData = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "var(--primary)",
	},
	mobile: {
		label: "Mobile",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: InventoryItem }) {
	const isMobile = useIsMobile();

	return (
		<Drawer direction={isMobile ? "bottom" : "right"}>
			<DrawerTrigger asChild>
				<Button variant="link" className="text-foreground w-fit px-0 text-left">
					{item.itemTitle}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="gap-1">
					<DrawerTitle>{item.itemTitle}</DrawerTitle>
					<DrawerDescription>
						{item.category} · ${item.itemCost.toFixed(2)}
					</DrawerDescription>
				</DrawerHeader>
				<div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
					<form className="flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							<Label htmlFor="itemTitle">Item Title</Label>
							<Input id="itemTitle" defaultValue={item.itemTitle} />
						</div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="itemDescription">Description</Label>
							<Input id="itemDescription" defaultValue={item.itemDescription} />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-3">
								<Label htmlFor="itemCost">Price</Label>
								<Input
									id="itemCost"
									type="number"
									step="0.01"
									defaultValue={item.itemCost}
								/>
							</div>
							<div className="flex flex-col gap-3">
								<Label htmlFor="category">Category</Label>
								<Select defaultValue={item.category}>
									<SelectTrigger id="category" className="w-full">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ELECTRONICS">Electronics</SelectItem>
										<SelectItem value="PRINTS">Prints</SelectItem>
										<SelectItem value="CUSTOM">Custom</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="badge">Badge</Label>
							<Select defaultValue={item.badge ?? ""}>
								<SelectTrigger id="badge" className="w-full">
									<SelectValue placeholder="Select a badge" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="BESTSELLER">Bestseller</SelectItem>
									<SelectItem value="NEW">New</SelectItem>
									<SelectItem value="SALE">Sale</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</form>
				</div>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose asChild>
						<Button variant="outline">Done</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
