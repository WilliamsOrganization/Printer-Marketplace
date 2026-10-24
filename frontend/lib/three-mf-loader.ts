import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import { strFromU8, unzipSync } from "three/examples/jsm/libs/fflate.module.js";
import type { Group } from "three";

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
		const slots = readBuildItemSlots(data);
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
 * The pindex of each build item's object, in build order. Undefined for
 * objects without one (e.g. component assemblies).
 */
function readBuildItemSlots(data: ArrayBuffer): (number | undefined)[] {
	const zip = unzipSync(new Uint8Array(data));
	const modelPath = Object.keys(zip).find((path) => /^3D\/.*\.model$/i.test(path));
	if (!modelPath) return [];

	const doc = new DOMParser().parseFromString(strFromU8(zip[modelPath]), "application/xml");
	const slotByObjectId = new Map<string, number>();
	for (const object of doc.querySelectorAll("resources > object")) {
		const pindex = object.getAttribute("pindex");
		const id = object.getAttribute("id");
		if (id && pindex !== null) slotByObjectId.set(id, Number(pindex));
	}
	return [...doc.querySelectorAll("build > item")].map((item) =>
		slotByObjectId.get(item.getAttribute("objectid") ?? ""),
	);
}
