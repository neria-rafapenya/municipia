package com.neria_municipio.api.application.port.in;

public record ResetPasswordCommand(String token, String newPassword) {
}
