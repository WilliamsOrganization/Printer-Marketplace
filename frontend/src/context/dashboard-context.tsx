"use client";
import api from "@/lib/api";
import { DashboardAnalyticsResponse, InventoryItem, Orders, Returns, User } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

type DashboardContextType = {
	inventory: InventoryItem[];
	setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
	orders: Orders[];
	setOrders: React.Dispatch<React.SetStateAction<Orders[]>>;
	returns: Returns[];
	setReturns: React.Dispatch<React.SetStateAction<Returns[]>>;
	users: User[];
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
	sessionCount: number;
	activeSessionCount: number;
	uniqueUserCount: number;
	growthRate: number | null;
	analytics: DashboardAnalyticsResponse | null;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
	const [inventory, setInventory] = useState<InventoryItem[]>([]);
	const [orders, setOrders] = useState<Orders[]>([]);
	const [returns, setReturns] = useState<Returns[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);

	useEffect(() => {
		api
			.get("/inventoryitem/admin/all")
			.then((res) => setInventory(res.data))
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	useEffect(() => {
		api
			.get("/orders/admin/all")
			.then((res) => setOrders(res.data))
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	useEffect(() => {
		api
			.get("/returns/all")
			.then((res) => setReturns(res.data))
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	useEffect(() => {
		api
			.get("/users")
			.then((res) => setUsers(res.data))
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	useEffect(() => {
		api
			.get<DashboardAnalyticsResponse>("/analytics/dashboard")
			.then((res) => setAnalytics(res.data))
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	return (
		<DashboardContext.Provider
			value={{
				inventory,
				setInventory,
				orders,
				setOrders,
				returns,
				setReturns,
				users,
				setUsers,
				sessionCount: analytics?.totalSessions ?? 0,
				activeSessionCount: analytics?.activeSessions ?? 0,
				uniqueUserCount: analytics?.uniqueSessionUsers ?? 0,
				growthRate: analytics?.sessionGrowthRatePercent ?? null,
				analytics,
			}}
		>
			{children}
		</DashboardContext.Provider>
	);
}

export function useDashboard() {
	const context = useContext(DashboardContext);
	if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
	return context;
}
