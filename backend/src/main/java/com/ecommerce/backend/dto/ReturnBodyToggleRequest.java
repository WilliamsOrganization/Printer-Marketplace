package com.ecommerce.backend.dto;

import lombok.Data;

@Data
public class ReturnBodyToggleRequest {
    private Boolean reviewed;
    private Long id;
}
