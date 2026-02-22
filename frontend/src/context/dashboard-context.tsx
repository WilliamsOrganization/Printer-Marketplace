"use client";
import api from "@/lib/api";
import { InventoryItem, User } from "@/lib/types";
import React, { createContext, useContext, useEffect, useState } from "react";

type DashboardContextType = {
	inventory: InventoryItem[];
	setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
	users: User[];
	setUsers: React.Dispatch<React.SetStateAction<User[]>>;
	sessionCount: number;
	activeSessionCount: number;
	uniqueUserCount: number;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
	const [inventory, setInventory] = useState<InventoryItem[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [sessionCount, setSessionCount] = useState<number>(0);
	const [activeSessionCount, setActiveSessionCount] = useState<number>(0);
	const [uniqueUserCount, setUniqueUserCount] = useState<number>(0);

	useEffect(() => {
		api
			.get("/inventoryitem")
			.then((res) => setInventory(res.data))
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
			.get("/session/stats")
			.then((res) => {
				setSessionCount(res.data.totalSessions);
				setActiveSessionCount(res.data.activeSessions);
				setUniqueUserCount(res.data.uniqueUsers);
			})
			.catch((err) => console.log("Error: " + err.message));
	}, []);

	return (
		<DashboardContext.Provider value={{ inventory, setInventory, users, setUsers, sessionCount, activeSessionCount, uniqueUserCount }}>
			{children}
		</DashboardContext.Provider>
	);
}

export function useDashboard() {
	const context = useContext(DashboardContext);
	if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
	return context;
}
