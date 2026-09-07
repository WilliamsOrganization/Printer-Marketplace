import api from "./api";

type PresignedImageUpload = {
	uploadUrl: string;
	publicUrl: string;
	key: string;
};

/**
 * Uploads product images straight to S3 instead of streaming them through
 * the backend. Runs on form submit, one file at a time, in order:
 *
 *   1. ask the backend for one presigned PUT URL per file
 *   2. PUT each file to S3 sequentially
 *   3. if any presign or upload fails, delete everything already uploaded
 *      in this batch and rethrow - the caller must not persist a partial set
 *   4. on full success, return the public URLs in the same order as `files`
 *
 * The returned URLs are what you hand to the item-save call.
 */
export async function uploadInventoryImages(files: File[]): Promise<string[]> {
	if (files.length === 0) return [];

	const { data: slots } = await api.post<PresignedImageUpload[]>(
		"/inventoryitem/images/presign",
		files.map((file) => ({
			filename: file.name,
			contentType: file.type || "application/octet-stream",
		})),
	);

	if (slots.length !== files.length) {
		throw new Error("Presign response did not cover every file");
	}

	const uploaded: string[] = [];
	try {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const { uploadUrl, publicUrl } = slots[i];

			// Bare fetch, not the axios instance: the S3 PUT is a plain
			// cross-origin request whose auth lives in the URL's query
			// string - it must not carry our Authorization header or cookies.
			const res = await fetch(uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type || "application/octet-stream" },
			});
			if (!res.ok) {
				throw new Error(`Upload failed for ${file.name} (HTTP ${res.status})`);
			}
			uploaded.push(publicUrl);
		}
	} catch (err) {
		if (uploaded.length > 0) {
			// Best-effort rollback; don't mask the original failure if it fails.
			await api
				.post("/inventoryitem/images/delete", uploaded)
				.catch(() => undefined);
		}
		throw err;
	}

	return uploaded;
}
