package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.application.port.in.AuthToken;
import com.neria_municipio.api.domain.model.User;

public interface AuthTokenPort {
    AuthToken issueToken(User user);
}
