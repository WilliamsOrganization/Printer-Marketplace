import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
	async rewrites() {
		return [
			{
				source:"/server/:path*",
				destination: 'http://backend:8080/server/:path*'
			}

		]
	}
};

export default nextConfig;
