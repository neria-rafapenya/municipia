package com.neria_municipio.api.application.port.in;

public record ChangePasswordCommand(
        Long userId,
        Long municipalityId,
        String currentPassword,
        String newPassword
) {
}
