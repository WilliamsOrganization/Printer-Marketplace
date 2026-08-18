'use client'

import * as React from 'react'
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
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
import { cn } from '@/lib/utils'
import { Orders, Shipping, ShippingStatus } from '@/lib/types'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { OrderUserDialog } from './order-user-dialog'
import { CreateLabelDialog } from './create-label-dialog'
import { AdvanceTrackingButton } from './advance-tracking-button'

// Order # and Tracking # are the least essential columns for the at-a-glance
// admin view - hide them once this table's own flex slot gets tight, so it
// can shrink to make room for the map sitting alongside it (see
// @container/shipments on the wrapper div in shipments-admin.tsx). This has
// to be a container query scoped to that wrapper, not the page's outer
// @container/main (too wide - it doesn't shrink when the map eats space,
// only the table's own flex slot does) and not a viewport breakpoint like
// lg: (the table narrows because of its flex sibling, not the window).
const RESPONSIVE_HIDDEN_COLUMNS = new Set(['id', 'tracking'])

const SHIPPING_STATUS_VARIANT: Record<ShippingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
	[ShippingStatus.PENDING]: 'outline',
	[ShippingStatus.PURCHASED]: 'secondary',
	[ShippingStatus.IN_TRANSIT]: 'default',
	[ShippingStatus.DELIVERED]: 'secondary',
}

// Unshipped first - same "needs attention" ordering used for the orders
// table's shipping-status sort (see orders-table.tsx's SHIPPING_STATUS_PRIORITY).
const SHIPPING_STATUS_PRIORITY: Record<ShippingStatus, number> = {
	[ShippingStatus.PENDING]: 0,
	[ShippingStatus.PURCHASED]: 1,
	[ShippingStatus.IN_TRANSIT]: 2,
	[ShippingStatus.DELIVERED]: 3,
}

export type ShippedOrder = Orders & { shipping: Shipping }

export function getShippedOrders(orders: Orders[]): ShippedOrder[] {
	return orders.filter((order): order is ShippedOrder => order.shipping != null)
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
	const [globalFilter, setGlobalFilter] = React.useState('')

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
				id: 'email',
				accessorFn: (row) => [row.user?.email ?? row.email, row.user?.phoneNumber].filter(Boolean).join(' '),
				header: () => <div>Customer</div>,
				cell: ({ row }) => (
					<div className="max-w-40">
						<OrderUserDialog user={row.original.user} />
					</div>
				),
			},
			{
				id: 'cardholderName',
				accessorFn: (row) => row.cardholderName ?? '',
				header: () => <div>Cardholder</div>,
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground max-w-32 truncate block">
						{row.original.cardholderName ?? '—'}
					</span>
				),
			},
			{
				id: 'destination',
				accessorFn: (row) =>
					[row.shipping.addressTo.street1, row.shipping.addressTo.street2, row.shipping.addressTo.city,
						row.shipping.addressTo.state, row.shipping.addressTo.zip].filter(Boolean).join(' '),
				header: () => <div>Destination</div>,
				cell: ({ row }) => {
					const addr = row.original.shipping.addressTo
					return (
						<div className="max-w-40 text-sm">
							<div className="truncate">
								{addr.street1}
								{addr.street2 ? ` ${addr.street2}` : ''}
							</div>
							<div className="text-muted-foreground truncate">
								{addr.city}, {addr.state} {addr.zip}
							</div>
						</div>
					)
				},
			},
			{
				id: 'currentLocation',
				accessorFn: (row) =>
					row.shipping.currentLocation
						? [row.shipping.currentLocation.city, row.shipping.currentLocation.state].filter(Boolean).join(' ')
						: '',
				header: () => <div>Current Location</div>,
				cell: ({ row }) => {
					const current = row.original.shipping.currentLocation
					return current ? (
						<div className="max-w-32 truncate text-sm text-muted-foreground">
							{current.city}
							{current.state ? `, ${current.state}` : ''}
						</div>
					) : (
						<span className="text-muted-foreground">—</span>
					)
				},
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
				accessorFn: (row) => row.shipping.trackingNumber ?? '',
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
		state: { pagination, globalFilter },
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		getRowId: (row) => row.shipping.id.toString(),
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<Input
					placeholder="Search…"
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="h-8 w-40 lg:w-56"
				/>
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
									<TableHead
										key={header.id}
										className={cn(RESPONSIVE_HIDDEN_COLUMNS.has(header.column.id) && 'hidden @3xl/shipments:table-cell')}
									>
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
										<TableCell
											key={cell.id}
											className={cn(RESPONSIVE_HIDDEN_COLUMNS.has(cell.column.id) && 'hidden @3xl/shipments:table-cell')}
										>
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
					{table.getFilteredRowModel().rows.length} of {shipments.length} shipment{shipments.length === 1 ? '' : 's'}
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
