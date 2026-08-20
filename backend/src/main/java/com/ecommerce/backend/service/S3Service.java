package com.ecommerce.backend.service;


import java.io.IOException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

/**
 * S3Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {
	private final S3Client s3Client;
	@Value("${aws.s3.bucket}")
	private String bucket;

	/**
	 * Uploads images to S3 and returns the S3 URLs.
	 *
	 * @param files the images to upload
	 * @return the S3 URLs
	 */
	public List<String> uploadImages(List<MultipartFile> files) {
		return files.stream()
				.map(file -> {
					String key = "public/products/" + UUID.randomUUID() + "-" +
							file.getOriginalFilename().replaceAll("\\s+", "-");
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
					return "https://" + bucket + ".s3.amazonaws.com/" + key;
				})
				.toList();
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
