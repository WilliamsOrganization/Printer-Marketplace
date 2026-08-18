"use client";

import * as React from "react";
import { IconArrowsSort } from "@tabler/icons-react";
import type { Table as TanstackTable, VisibilityState } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ColumnVisibilityDropdown } from "@/components/ui/custom/data-table-grid";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTable } from "./inventory-table";
import { OrdersTable, ORDER_SORT_MODE_LABEL, type OrderSortMode } from "./orders-table";
import { ReturnsTable } from "./returns-table";

export function DataTable() {
	const [activeTab, setActiveTab] = React.useState("inventory");

	const [inventoryGlobalFilter, setInventoryGlobalFilter] = React.useState("");
	const [ordersGlobalFilter, setOrdersGlobalFilter] = React.useState("");
	const [returnsGlobalFilter, setReturnsGlobalFilter] = React.useState("");

	const [inventoryColumnVisibility, setInventoryColumnVisibility] = React.useState<VisibilityState>({});
	const [ordersColumnVisibility, setOrdersColumnVisibility] = React.useState<VisibilityState>({});
	const [returnsColumnVisibility, setReturnsColumnVisibility] = React.useState<VisibilityState>({});

	const [inventoryTable, setInventoryTable] = React.useState<TanstackTable<any> | null>(null);
	const [ordersTable, setOrdersTable] = React.useState<TanstackTable<any> | null>(null);
	const [returnsTable, setReturnsTable] = React.useState<TanstackTable<any> | null>(null);

	const [sortMode, setSortMode] = React.useState<OrderSortMode>("default");

	const activeTable =
		activeTab === "inventory" ? inventoryTable : activeTab === "orders" ? ordersTable : activeTab === "returns" ? returnsTable : null;

	const activeGlobalFilter =
		activeTab === "inventory" ? inventoryGlobalFilter : activeTab === "orders" ? ordersGlobalFilter : returnsGlobalFilter;
	const setActiveGlobalFilter =
		activeTab === "inventory" ? setInventoryGlobalFilter : activeTab === "orders" ? setOrdersGlobalFilter : setReturnsGlobalFilter;

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
						<SelectItem value="returns">Returns</SelectItem>
					</SelectContent>
				</Select>
				<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
					<TabsTrigger value="inventory">Inventory Items</TabsTrigger>
					<TabsTrigger value="orders">Orders</TabsTrigger>
					<TabsTrigger value="returns">Returns</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2">
					<Input
						placeholder="Search…"
						value={activeGlobalFilter}
						onChange={(e) => setActiveGlobalFilter(e.target.value)}
						className="h-8 w-40 lg:w-56"
					/>
					<ColumnVisibilityDropdown table={activeTable} />
					{activeTab === "orders" && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant={sortMode !== "default" ? "default" : "outline"}
									size="sm"
								>
									<IconArrowsSort />
									<span className="hidden lg:inline">Sort</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								<DropdownMenuRadioGroup value={sortMode} onValueChange={(value) => setSortMode(value as OrderSortMode)}>
									{(Object.keys(ORDER_SORT_MODE_LABEL) as OrderSortMode[]).map((mode) => (
										<DropdownMenuRadioItem key={mode} value={mode}>
											{ORDER_SORT_MODE_LABEL[mode]}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
			<TabsContent
				value="inventory"
				forceMount
				className="flex flex-col px-4 data-[state=inactive]:hidden lg:px-6"
			>
				<InventoryTable
					globalFilter={inventoryGlobalFilter}
					columnVisibility={inventoryColumnVisibility}
					onColumnVisibilityChange={setInventoryColumnVisibility}
					onTableChange={setInventoryTable}
				/>
			</TabsContent>
			<TabsContent
				value="orders"
				forceMount
				className="flex flex-col px-4 data-[state=inactive]:hidden lg:px-6"
			>
				<OrdersTable
					globalFilter={ordersGlobalFilter}
					columnVisibility={ordersColumnVisibility}
					onColumnVisibilityChange={setOrdersColumnVisibility}
					onTableChange={setOrdersTable}
					sortMode={sortMode}
				/>
			</TabsContent>
			<TabsContent
				value="returns"
				forceMount
				className="flex flex-col px-4 data-[state=inactive]:hidden lg:px-6"
			>
				<ReturnsTable
					globalFilter={returnsGlobalFilter}
					columnVisibility={returnsColumnVisibility}
					onColumnVisibilityChange={setReturnsColumnVisibility}
					onTableChange={setReturnsTable}
				/>
			</TabsContent>
		</Tabs>
	);
}

export default DataTable;
