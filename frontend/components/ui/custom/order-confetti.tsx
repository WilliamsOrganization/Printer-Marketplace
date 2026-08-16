"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

/**
 * Fires a confetti burst once when the order-completion page mounts.
 * Renders nothing - it's pure side effect.
 */
export function OrderConfetti() {
	useEffect(() => {
		confetti({
			particleCount: 700,
			spread: 300,
			startVelocity: 55,
			scalar: 1.6,
			ticks: 350,
			origin: { y: 0.6 },
		});
	}, []);

	return null;
}
