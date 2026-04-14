package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(max = 150) String fullName,
        @Email @Size(max = 100) String email
) {
}
