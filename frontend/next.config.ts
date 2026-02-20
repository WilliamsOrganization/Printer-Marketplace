import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
	async rewrites() {
		return [
			{
				// TODO: remember to find a separate env variable for the production deployment
				source:"/server/:path*",
				destination: 'http://backend:8080/server/:path*'
			}

		]
	}
};

export default nextConfig;
