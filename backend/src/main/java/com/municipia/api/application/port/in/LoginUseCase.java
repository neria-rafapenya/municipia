package com.municipia.api.application.port.in;

public interface LoginUseCase {
    AuthToken login(LoginCommand command);
}
