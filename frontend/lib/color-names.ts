import type { ColorName } from "color-name-list/bestof";

export type Rgb = [number, number, number];

export function toRgb(hex: string): Rgb {
	const n = parseInt(hex.slice(1), 16);
	return [n >> 16, (n >> 8) & 0xff, n & 0xff];
}

// "Redmean" weighted RGB distance - close enough to perceptual for naming,
// without converting everything to Lab.
export function colorDistance([r1, g1, b1]: Rgb, [r2, g2, b2]: Rgb) {
	const rMean = (r1 + r2) / 2;
	const dr = r1 - r2;
	const dg = g1 - g2;
	const db = b1 - b2;
	return (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db;
}

let palette: Promise<{ name: string; rgb: Rgb }[]> | null = null;

// The list is ~200KB, so it's only fetched the first time a name is needed.
function loadPalette() {
	palette ??= import("color-name-list/bestof").then(({ colornames }) =>
		colornames.map((c: ColorName) => ({ name: c.name, rgb: toRgb(c.hex) })),
	);
	return palette;
}

/**
 * The name of the closest color in color-name-list's "best of" list,
 * e.g. "#1A1A1A" -> "Eerie Black".
 */
export async function nameColor(hex: string): Promise<string> {
	const target = toRgb(hex);
	let best = { name: "", d: Infinity };
	for (const { name, rgb } of await loadPalette()) {
		const d = colorDistance(target, rgb);
		if (d < best.d) best = { name, d };
	}
	return best.name;
}
