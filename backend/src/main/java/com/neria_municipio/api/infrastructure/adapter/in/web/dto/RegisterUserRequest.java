package com.neria_municipio.api.infrastructure.adapter.in.web.dto;

import com.neria_municipio.api.domain.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterUserRequest(
        @NotNull Long municipalityId,
        @NotBlank @Size(max = 150) String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotNull UserRole role
) {
}
