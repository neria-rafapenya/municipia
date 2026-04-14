package com.neria_municipio.api.application.port.in;

public record DeleteNewsCommand(Long newsId, Long municipalityId) {
}
