import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { strFromU8, unzipSync } from "three/examples/jsm/libs/fflate.module.js";
import type { Group } from "three";
import { colorDistance, toRgb } from "./color-names";
import type { Color, UnsavedInventoryItemFieldThreeMFRegion } from "./types";

/**
 * ThreeMFLoader that also tags every mesh with `userData.slot`, the 3MF
 * pindex of the object it came from. That's the slotIndex the backend's
 * 3MF regions use, so region colors can be applied by slot.
 *
 * The stock loader reads pindex but doesn't expose it, so the model XML is
 * read a second time here. It adds one group child per <build><item>, in
 * file order, which is what lets the two line up.
 */
export class SlottedThreeMFLoader extends ThreeMFLoader {
	parse(data: ArrayBuffer): Group {
		const group = super.parse(data);
		const doc = readModelDocument(data);
		const slots = doc ? readBuildItemSlots(doc) : [];
		group.children.forEach((child, i) => {
			const slot = slots[i];
			if (slot === undefined) return;
			child.traverse((obj) => {
				obj.userData.slot = slot;
			});
		});
		return group;
	}
}

/**
 * Generates the regions a 3MF color picker field stores, one per slot
 * (pindex) used by the file's build items:
 *
 * - `name` is the first object in that slot, e.g. "Buckle"
 * - `options` offers every color in `palette`, closest to the file's own
 *   color for that slot first
 *
 * Assumes the file uses a single color group, which is how slicers and CAD
 * exports write multi-color parts.
 */
export function readThreeMFRegions(data: ArrayBuffer, palette: Color[]): UnsavedInventoryItemFieldThreeMFRegion[] {
	const doc = readModelDocument(data);
	if (!doc) throw new Error("Not a 3MF file: no 3D model part found");

	const objects = readObjects(doc);
	const fileColors = readFileColors(doc);
	const regions = new Map<number, UnsavedInventoryItemFieldThreeMFRegion>();

	for (const item of doc.querySelectorAll("build > item")) {
		const object = objects.get(item.getAttribute("objectid") ?? "");
		if (object?.slot === undefined || regions.has(object.slot)) continue;

		const fileHex = object.pid ? fileColors.get(object.pid)?.[object.slot] : undefined;
		const byCloseness = fileHex
			? [...palette].sort((a, b) => colorDistance(toRgb(a.hex), toRgb(fileHex)) - colorDistance(toRgb(b.hex), toRgb(fileHex)))
			: palette;

		regions.set(object.slot, {
			slotIndex: object.slot,
			name: object.name ?? `Region ${object.slot + 1}`,
			options: byCloseness.map((color) => ({ label: color.name, price: 0, selectedColor: color })),
		});
	}

	if (regions.size === 0) throw new Error("This 3MF file has no color regions (no objects use a color slot)");
	return [...regions.values()].sort((a, b) => a.slotIndex - b.slotIndex);
}

function readModelDocument(data: ArrayBuffer): Document | null {
	const zip = unzipSync(new Uint8Array(data));
	const modelPath = Object.keys(zip).find((path) => /^3D\/.*\.model$/i.test(path));
	if (!modelPath) return null;
	return new DOMParser().parseFromString(strFromU8(zip[modelPath]), "application/xml");
}

type ModelObject = { name?: string; pid?: string; slot?: number };

function readObjects(doc: Document): Map<string, ModelObject> {
	const objects = new Map<string, ModelObject>();
	for (const object of doc.querySelectorAll("resources > object")) {
		const pindex = object.getAttribute("pindex");
		objects.set(object.getAttribute("id") ?? "", {
			name: object.getAttribute("name") ?? undefined,
			pid: object.getAttribute("pid") ?? undefined,
			slot: pindex === null ? undefined : Number(pindex),
		});
	}
	return objects;
}

/**
 * The pindex of each build item's object, in build order. Undefined for
 * objects without one (e.g. component assemblies).
 */
function readBuildItemSlots(doc: Document): (number | undefined)[] {
	const objects = readObjects(doc);
	return [...doc.querySelectorAll("build > item")].map((item) => objects.get(item.getAttribute("objectid") ?? "")?.slot);
}

/**
 * Property group id -> its colors as #RRGGBB, from <m:colorgroup> and
 * <basematerials>. Namespaced tags don't work with querySelector, hence
 * getElementsByTagNameNS.
 */
function readFileColors(doc: Document): Map<string, string[]> {
	const groups = new Map<string, string[]>();
	const hexOf = (value: string | null) => (value ? value.slice(0, 7).toUpperCase() : "#808080");

	for (const group of doc.getElementsByTagNameNS("*", "colorgroup")) {
		const colors = [...group.getElementsByTagNameNS("*", "color")].map((c) => hexOf(c.getAttribute("color")));
		groups.set(group.getAttribute("id") ?? "", colors);
	}
	for (const group of doc.getElementsByTagNameNS("*", "basematerials")) {
		const colors = [...group.getElementsByTagNameNS("*", "base")].map((b) => hexOf(b.getAttribute("displaycolor")));
		groups.set(group.getAttribute("id") ?? "", colors);
	}
	return groups;
}
