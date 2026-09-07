package com.ecommerce.backend.dto;

/**
 * A single presigned upload slot returned to the client.
 *
 * @param uploadUrl short-lived presigned S3 PUT URL - the client uploads the
 *                  file bytes here directly, no auth header needed
 * @param publicUrl the URL the object will be reachable at once uploaded;
 *                  this is what gets persisted on the inventory item
 * @param key       the S3 object key, handed back so the client can ask the
 *                  server to clean it up if a later upload in the batch fails
 */
public record PresignedImageUpload(String uploadUrl, String publicUrl, String key) {
}
