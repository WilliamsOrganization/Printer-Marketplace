"use client";

import * as React from "react";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconLayoutColumns,
} from "@tabler/icons-react";
import { flexRender, type Row, type Table as TanstackTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

/**
 * The header/body render loop shared by every admin table - accepts an
 * optional renderRow override for tables that need to wrap rows in extra
 * context (e.g. drag-and-drop) instead of a plain TableRow.
 */
export function DataTableGrid<T>({
	table,
	emptyMessage,
	renderRow,
}: {
	table: TanstackTable<T>;
	emptyMessage: string;
	renderRow?: (row: Row<T>) => React.ReactNode;
}) {
	return (
		<div className="overflow-hidden rounded-lg border">
			<Table>
				<TableHeader className="bg-muted sticky top-0 z-10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} colSpan={header.colSpan}>
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
						table.getRowModel().rows.map((row) =>
							renderRow ? (
								renderRow(row)
							) : (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							),
						)
					) : (
						<TableRow>
							<TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
								{emptyMessage}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

/**
 * The "N of M things · ‹ Page X of Y ›" footer shared by the simple
 * (non-selectable, non-reorderable) admin tables.
 */
export function DataTableSimplePagination<T>({
	table,
	itemLabel,
	count,
}: {
	table: TanstackTable<T>;
	itemLabel: string;
	count: number;
}) {
	return (
		<div className="flex items-center justify-between px-1">
			<div className="text-muted-foreground text-sm">
				{table.getFilteredRowModel().rows.length} of {count} {itemLabel}
				{count === 1 ? "" : "s"}
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
	);
}

/**
 * "Customize Columns" toolbar dropdown - generic over whichever table is
 * currently active, since it lives in the shared toolbar above the tabs.
 */
export function ColumnVisibilityDropdown({ table }: { table: TanstackTable<any> | null }) {
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
