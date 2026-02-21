import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
	baseURL: "/server",
	withCredentials:true,
	headers: {
		"Content-Type": "application/json",
	},
})

api.interceptors.request.use(async (config)=>{
	const session = await getSession();
	if (session?.backendToken){
		config.headers.Authorization = `Bearer ${session.backendToken}`;
	}
	return config;
})

export default api;

