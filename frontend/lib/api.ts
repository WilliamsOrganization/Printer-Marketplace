import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
	baseURL: "/server",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
})

api.interceptors.request.use(async (config) => {
	const session = await getSession();
	if (session?.backendToken) {
		config.headers.Authorization = `Bearer ${session.backendToken}`;
	} else {
		const guestToken = localStorage.getItem("guestToken");
		if (guestToken) {
			config.headers.Authorization = `Bearer ${guestToken}`;
		}
	}
	return config;
})

export default api;

