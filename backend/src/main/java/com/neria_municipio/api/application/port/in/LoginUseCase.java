package com.neria_municipio.api.application.port.in;

public interface LoginUseCase {
    AuthToken login(LoginCommand command);
}
