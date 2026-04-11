package com.municipia.api.application.port.in;

public record ResetPasswordCommand(String token, String newPassword) {
}
