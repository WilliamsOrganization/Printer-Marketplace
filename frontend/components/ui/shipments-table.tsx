'use client'

import * as React from 'react'
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
} from '@tanstack/react-table'
import {
	IconArrowsSort,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Orders, Shipping, ShippingStatus } from '@/lib/types'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './table'
import { Badge } from './badge'
import { Button } from './button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from './dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './select'
import { Label } from './label'
import { Input } from './input'

const SHIPPING_STATUS_VARIANT: Record<ShippingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	[ShippingStatus.PENDING]: 'outline',
	[ShippingStatus.PURCHASED]: 'secondary',
	[ShippingStatus.IN_TRANSIT]: 'default',
	[ShippingStatus.DELIVERED]: 'secondary',
}

// Unshipped first - same "needs attention" ordering used for the orders
// table's shipping-status sort (see data-table.tsx's SHIPPING_STATUS_PRIORITY).
const SHIPPING_STATUS_PRIORITY: Record<ShippingStatus, number> = {
	[ShippingStatus.PENDING]: 0,
	[ShippingStatus.PURCHASED]: 1,
	[ShippingStatus.IN_TRANSIT]: 2,
	[ShippingStatus.DELIVERED]: 3,
}

// Mirrors backend ShippingParcel.SizeCategory/WeightCategory - deliberately
// its own, wider-ranging set of boxes/weights from InventoryItem's, since
// one shipment box can hold many items combined. These are just presets to
// prefill the form below - the actual fields stay freely editable so a
// custom size/weight can be entered instead.
const SIZE_PRESETS = [
	{ name: 'SMALL', lengthCm: 20, widthCm: 15, heightCm: 10 },
	{ name: 'MEDIUM', lengthCm: 30, widthCm: 23, heightCm: 15 },
	{ name: 'LARGE', lengthCm: 40, widthCm: 30, heightCm: 20 },
	{ name: 'EXTRA_LARGE', lengthCm: 50, widthCm: 40, heightCm: 30 },
	{ name: 'JUMBO', lengthCm: 60, widthCm: 45, heightCm: 40 },
] as const

const WEIGHT_PRESETS = [
	{ name: 'LIGHT', grams: 500 },
	{ name: 'MEDIUM', grams: 1500 },
	{ name: 'HEAVY', grams: 4000 },
	{ name: 'EXTRA_HEAVY', grams: 8000 },
	{ name: 'BULK', grams: 15000 },
] as const

export type ShippedOrder = Orders & { shipping: Shipping }

export function getShippedOrders(orders: Orders[]): ShippedOrder[] {
	return orders.filter((order): order is ShippedOrder => order.shipping != null)
}

function CreateLabelDialog({
	order,
	onCreated,
}: {
	order: ShippedOrder
	onCreated: (shipping: Shipping) => void
}) {
	const defaultSize = SIZE_PRESETS[1] // MEDIUM
	const defaultWeight = WEIGHT_PRESETS[1] // MEDIUM

	const [open, setOpen] = React.useState(false)
	const [sizePreset, setSizePreset] = React.useState<string>(defaultSize.name)
	const [weightPreset, setWeightPreset] = React.useState<string>(defaultWeight.name)
	const [lengthCm, setLengthCm] = React.useState<number>(defaultSize.lengthCm)
	const [widthCm, setWidthCm] = React.useState<number>(defaultSize.widthCm)
	const [heightCm, setHeightCm] = React.useState<number>(defaultSize.heightCm)
	const [weightGrams, setWeightGrams] = React.useState<number>(defaultWeight.grams)
	const [loading, setLoading] = React.useState(false)

	const applySizePreset = (name: string) => {
		setSizePreset(name)
		const preset = SIZE_PRESETS.find((p) => p.name === name)
		if (preset) {
			setLengthCm(preset.lengthCm)
			setWidthCm(preset.widthCm)
			setHeightCm(preset.heightCm)
		}
	}

	const applyWeightPreset = (name: string) => {
		setWeightPreset(name)
		const preset = WEIGHT_PRESETS.find((p) => p.name === name)
		if (preset) setWeightGrams(preset.grams)
	}

	const submit = () => {
		setLoading(true)
		api
			.post<Shipping>(`/shipping/${order.id}/label`, { lengthCm, widthCm, heightCm, weightGrams })
			.then((res) => {
				toast.success(`Label created for order #${order.id}`)
				onCreated(res.data)
				setOpen(false)
			})
			.catch((err) => {
				toast.error('Failed to create shipping label: ' + err.message)
			})
			.finally(() => setLoading(false))
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Create Label
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create shipping label for order #{order.id}</DialogTitle>
					<DialogDescription>
						Pick a preset to prefill the real box size/weight used to pack this
						order, or edit the fields directly - it can be larger than any single
						item's own size, since several items may ship together.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label htmlFor="size-preset">Box size preset</Label>
						<Select value={sizePreset} onValueChange={applySizePreset}>
							<SelectTrigger id="size-preset">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{SIZE_PRESETS.map((size) => (
									<SelectItem key={size.name} value={size.name}>
										{size.name} ({size.lengthCm}×{size.widthCm}×{size.heightCm} cm)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-3 gap-2">
						<div className="flex flex-col gap-2">
							<Label htmlFor="length-cm">Length (cm)</Label>
							<Input
								id="length-cm"
								type="number"
								min={1}
								value={lengthCm}
								onChange={(e) => setLengthCm(Number(e.target.value))}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="width-cm">Width (cm)</Label>
							<Input
								id="width-cm"
								type="number"
								min={1}
								value={widthCm}
								onChange={(e) => setWidthCm(Number(e.target.value))}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="height-cm">Height (cm)</Label>
							<Input
								id="height-cm"
								type="number"
								min={1}
								value={heightCm}
								onChange={(e) => setHeightCm(Number(e.target.value))}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="weight-preset">Weight preset</Label>
						<Select value={weightPreset} onValueChange={applyWeightPreset}>
							<SelectTrigger id="weight-preset">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{WEIGHT_PRESETS.map((weight) => (
									<SelectItem key={weight.name} value={weight.name}>
										{weight.name} ({weight.grams}g)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="weight-grams">Weight (grams)</Label>
						<Input
							id="weight-grams"
							type="number"
							min={1}
							value={weightGrams}
							onChange={(e) => setWeightGrams(Number(e.target.value))}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button onClick={submit} disabled={loading}>
						{loading ? 'Purchasing…' : 'Purchase Label'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

function AdvanceTrackingButton({
	order,
	onAdvanced,
}: {
	order: ShippedOrder
	onAdvanced: (shipping: Shipping) => void
}) {
	const [loading, setLoading] = React.useState(false)

	const advance = () => {
		setLoading(true)
		api
			.post<Shipping>(`/mock-shippo/${order.id}/advance`)
			.then((res) => {
				toast.success(`Order #${order.id} advanced to ${res.data.status}`)
				onAdvanced(res.data)
			})
			.catch((err) => {
				toast.error('Failed to advance tracking: ' + err.message)
			})
			.finally(() => setLoading(false))
	}

	return (
		<Button variant="ghost" size="sm" onClick={advance} disabled={loading}>
			{loading ? 'Advancing…' : 'Advance'}
		</Button>
	)
}

export default function ShipmentsTable({
	shipments,
	onShippingUpdated,
	onRowClick,
}: {
	shipments: ShippedOrder[]
	onShippingUpdated: (orderId: number, shipping: Shipping) => void
	onRowClick?: (order: ShippedOrder) => void
}) {
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 12 })
	const [sortByStatus, setSortByStatus] = React.useState(true)
	const [sortByDate, setSortByDate] = React.useState(true)

	// Same independent-toggle pattern as the orders table's Sort dropdown -
	// status (when on) always wins ties first, date (when on) breaks those
	// ties; with only one on, that's the sole key.
	const sortedShipments = React.useMemo(() => {
		if (!sortByStatus && !sortByDate) return shipments
		return [...shipments].sort((a, b) => {
			if (sortByStatus) {
				const diff = SHIPPING_STATUS_PRIORITY[a.shipping.status] - SHIPPING_STATUS_PRIORITY[b.shipping.status]
				if (diff !== 0) return diff
			}
			if (sortByDate) {
				return new Date(a.shipping.createdAt).getTime() - new Date(b.shipping.createdAt).getTime()
			}
			return 0
		})
	}, [shipments, sortByStatus, sortByDate])

	const columns = React.useMemo<ColumnDef<ShippedOrder>[]>(
		() => [
			{
				accessorKey: 'id',
				header: () => <div>Order</div>,
				cell: ({ row }) => <div className="font-medium">#{row.original.id}</div>,
			},
			{
				id: 'destination',
				header: () => <div>Destination</div>,
				cell: ({ row }) => (
					<div>
						{row.original.shipping.addressTo.city}, {row.original.shipping.addressTo.state}
					</div>
				),
			},
			{
				accessorKey: 'shipping.status',
				header: () => <div>Status</div>,
				cell: ({ row }) => (
					<Badge variant={SHIPPING_STATUS_VARIANT[row.original.shipping.status]}>
						{row.original.shipping.status}
					</Badge>
				),
			},
			{
				id: 'tracking',
				header: () => <div>Tracking</div>,
				cell: ({ row }) =>
					row.original.shipping.trackingUrl ? (
						<a
							href={row.original.shipping.trackingUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary underline underline-offset-4"
						>
							{row.original.shipping.trackingNumber ?? 'Track'}
						</a>
					) : (
						<span className="text-muted-foreground">—</span>
					),
			},
			{
				id: 'label',
				header: () => <div className="text-center">Label</div>,
				cell: ({ row }) => (
					<div className="flex justify-center">
						{row.original.shipping.labelPdfUrl ? (
							<a
								href={row.original.shipping.labelPdfUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary underline underline-offset-4"
							>
								Label
							</a>
						) : (
							<CreateLabelDialog
								order={row.original}
								onCreated={(shipping) => onShippingUpdated(row.original.id, shipping)}
							/>
						)}
					</div>
				),
			},
			{
				id: 'test',
				header: () => <div className="text-center">Test</div>,
				cell: ({ row }) => (
					<div className="flex justify-center">
						{row.original.shipping.trackingNumber ? (
							<AdvanceTrackingButton
								order={row.original}
								onAdvanced={(shipping) => onShippingUpdated(row.original.id, shipping)}
							/>
						) : (
							<span className="text-muted-foreground">—</span>
						)}
					</div>
				),
			},
		],
		[onShippingUpdated],
	)

	const table = useReactTable({
		data: sortedShipments,
		columns,
		state: { pagination },
		onPaginationChange: setPagination,
		getRowId: (row) => row.shipping.id.toString(),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-end">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={sortByStatus || sortByDate ? 'default' : 'outline'} size="sm">
							<IconArrowsSort />
							<span className="hidden lg:inline">Sort</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<DropdownMenuCheckboxItem
							checked={sortByStatus}
							onSelect={(e) => e.preventDefault()}
							onCheckedChange={setSortByStatus}
						>
							Status (unshipped first)
						</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem
							checked={sortByDate}
							onSelect={(e) => e.preventDefault()}
							onCheckedChange={setSortByDate}
						>
							Date created (oldest first)
						</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
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
								<TableRow
									key={row.id}
									className={onRowClick ? 'cursor-pointer' : undefined}
									onClick={() => onRowClick?.(row.original)}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No shipments yet.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between px-1">
				<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
					{shipments.length} shipment{shipments.length === 1 ? '' : 's'}
				</div>
				<div className="flex w-full items-center gap-8 lg:w-fit">
					<div className="hidden items-center gap-2 lg:flex">
						<Label htmlFor="shipments-rows-per-page" className="text-sm font-medium">
							Rows per page
						</Label>
						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => table.setPageSize(Number(value))}
						>
							<SelectTrigger size="sm" className="w-20" id="shipments-rows-per-page">
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>
							<SelectContent side="top">
								{[12, 16, 24, 32, 48].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex w-fit items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
	)
}
