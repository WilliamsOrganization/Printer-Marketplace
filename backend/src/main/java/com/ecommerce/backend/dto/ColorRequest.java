/* (C)2026 */
package com.ecommerce.backend.dto;

/**
 * Body for creating or updating a Color. isDisabled may be null and defaults to
 * false on create, or leaves the current value on update.
 */
public record ColorRequest(String name, String hex, Boolean isDisabled) {
}
