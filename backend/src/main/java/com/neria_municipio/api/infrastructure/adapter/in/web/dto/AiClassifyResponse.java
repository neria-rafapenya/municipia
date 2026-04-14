package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

public record AiClassifyResponse(String category, Float confidence, Long categoryId) {
}
