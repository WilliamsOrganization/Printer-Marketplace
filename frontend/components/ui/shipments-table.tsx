'use client'

import * as React from 'react'
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
} from '@tanstack/react-table'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
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

export default function ShipmentsTable({
	shipments,
	onLabelCreated,
	onRowClick,
}: {
	shipments: ShippedOrder[]
	onLabelCreated: (orderId: number, shipping: Shipping) => void
	onRowClick?: (order: ShippedOrder) => void
}) {
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 16 })

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
								onCreated={(shipping) => onLabelCreated(row.original.id, shipping)}
							/>
						)}
					</div>
				),
			},
		],
		[onLabelCreated],
	)

	const table = useReactTable({
		data: shipments,
		columns,
		state: { pagination },
		onPaginationChange: setPagination,
		getRowId: (row) => row.shipping.id.toString(),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	})

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
				<div className="text-muted-foreground text-sm">
					{shipments.length} shipment{shipments.length === 1 ? '' : 's'}
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
	)
}
