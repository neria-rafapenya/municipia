package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.User;

public interface UpdateUserProfileUseCase {
    User updateProfile(UpdateUserProfileCommand command);
}
