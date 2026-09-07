package com.ecommerce.backend.dto;

/**
 * One file the client wants to upload straight to S3. The client sends a
 * list of these; the server signs one PUT URL per entry.
 *
 * @param filename    original file name, used only to build a readable key
 * @param contentType MIME type the client will PUT with - it's baked into
 *                    the signature, so the client must send the exact same
 *                    Content-Type header or S3 rejects the upload
 */
public record PresignImageUploadRequest(String filename, String contentType) {
}
