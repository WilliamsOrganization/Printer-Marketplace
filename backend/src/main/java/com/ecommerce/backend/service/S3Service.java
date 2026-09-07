package com.ecommerce.backend.service;


import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ecommerce.backend.dto.PresignImageUploadRequest;
import com.ecommerce.backend.dto.PresignedImageUpload;
import com.ecommerce.backend.entity.InventoryItem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

/**
 * S3Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
	private static final String KEY_PREFIX = "public/products/";

	private final S3Client s3Client;
	private final S3Presigner s3Presigner;

	@Value("${aws.s3.bucket}")
	private String bucket;

	/** How long a presigned upload URL stays valid. */
	@Value("${aws.s3.presign-expiry-seconds:300}")
	private long presignExpirySeconds;

	/**
	 * Uploads images to S3 and returns the S3 URLs.
	 *
	 * @param files the images to upload
	 * @return the S3 URLs
	 */
	public List<String> uploadImages(List<MultipartFile> files) {
		return files.stream()
				.map(file -> {
					String key = keyFor(file.getOriginalFilename());
					try {
						s3Client.putObject(
								PutObjectRequest.builder()
										.bucket(bucket)
										.key(key)
										.contentType(file.getContentType())
										.build(),
								RequestBody
										.fromInputStream(file.getInputStream(),
												file.getSize()));
					} catch (IOException e) {
						throw new RuntimeException(
								"Failed to upload " + file.getOriginalFilename(), e);
					}
					return publicUrl(key);
				})
				.toList();
	}

	/**
	 * Signs one short-lived PUT URL per requested file so the browser can
	 * upload product images straight to S3 - keeps large multi-image
	 * submits from streaming through this service. Nothing is written to S3
	 * here; the objects only exist once the client actually PUTs to the
	 * returned URLs (and confirms success by handing the publicUrls to the
	 * item-save call).
	 *
	 * @param requests the files the client intends to upload
	 * @return a presigned slot per request, in the same order
	 */
	public List<PresignedImageUpload> presignUploads(List<PresignImageUploadRequest> requests) {
		return requests.stream()
				.map(req -> {
					String key = keyFor(req.filename());
					PutObjectRequest put = PutObjectRequest.builder()
							.bucket(bucket)
							.key(key)
							.contentType(req.contentType())
							.build();
					String uploadUrl = s3Presigner.presignPutObject(
							PutObjectPresignRequest.builder()
									.signatureDuration(Duration.ofSeconds(presignExpirySeconds))
									.putObjectRequest(put)
									.build())
							.url()
							.toString();
					return new PresignedImageUpload(uploadUrl, publicUrl(key), key);
				})
				.toList();
	}

	/**
	 * Best-effort cleanup for a batch upload that failed partway: deletes
	 * whatever the client already managed to PUT before it hit an error.
	 * Only keys under this service's own prefix are touched.
	 *
	 * @param urls the publicUrls of objects to remove
	 */
	public void deleteObjects(List<String> urls) throws SdkException {
		if (urls == null || urls.isEmpty()) {
			return;
		}
		List<ObjectIdentifier> toDelete = urls.stream()
				.map(this::keyFromUrl)
				.filter(key -> key.startsWith(KEY_PREFIX))
				.map(key -> ObjectIdentifier.builder().key(key).build())
				.toList();
		if (toDelete.isEmpty()) {
			return;
		}
		s3Client.deleteObjects(DeleteObjectsRequest.builder()
				.bucket(bucket)
				.delete(Delete.builder().objects(toDelete).build())
				.build());
	}

	private String keyFor(String originalFilename) {
		String name = originalFilename == null ? "file" : originalFilename.replaceAll("\\s+", "-");
		return KEY_PREFIX + UUID.randomUUID() + "-" + name;
	}

	private String publicUrl(String key) {
		return "https://" + bucket + ".s3.amazonaws.com/" + key;
	}

	/**
	 * Deletes every image currently associated with the given item from S3.
	 * Uses the exact keys recorded in its imageUrls rather than a prefix
	 * scan - images are uploaded (and get their random-UUID keys) before
	 * the item exists, so there's no per-item folder to scan by prefix.
	 *
	 * @param item the item whose images should be removed
	 */
	public void deleteImages(InventoryItem item) throws SdkException {
		deleteByUrls(item.getImageUrls());
	}

	/**
	 * Reconciles an item's images with a new set of URLs on edit: deletes
	 * from S3 whatever image was on the item before but isn't in newUrls
	 * anymore. Images that are still present, or are newly added, are left
	 * alone.
	 *
	 * @param newUrls the URLs the item should have after this update
	 * @param item    the item as it currently stands, before the update is applied
	 */
	public void updateImages(String[] newUrls, InventoryItem item) throws SdkException {
		String[] currentUrls = item.getImageUrls();
		if (currentUrls == null || currentUrls.length == 0) {
			return;
		}
		Set<String> keep = newUrls == null ? Set.of() : Set.of(newUrls);
		String[] removed = Arrays.stream(currentUrls)
				.filter(url -> !keep.contains(url))
				.toArray(String[]::new);
		deleteByUrls(removed);
	}

	private void deleteByUrls(String[] urls) throws SdkException {
		if (urls == null || urls.length == 0) {
			return;
		}
		List<ObjectIdentifier> toDelete = Arrays.stream(urls)
				.map(this::keyFromUrl)
				.map(key -> ObjectIdentifier.builder().key(key).build())
				.toList();

		s3Client.deleteObjects(DeleteObjectsRequest.builder()
				.bucket(bucket)
				.delete(Delete.builder().objects(toDelete).build())
				.build());
	}

	private String keyFromUrl(String url) {
		String path = URI.create(url).getPath();
		return path.startsWith("/") ? path.substring(1) : path;
	}
}
