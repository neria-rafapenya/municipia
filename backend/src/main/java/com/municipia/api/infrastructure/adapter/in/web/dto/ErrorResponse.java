package com.municipia.api.infrastructure.adapter.in.web.dto;

import java.util.Map;

public record ErrorResponse(String error, String message, Map<String, String> fields) {
    public static ErrorResponse of(String error, String message) {
        return new ErrorResponse(error, message, Map.of());
    }
}
