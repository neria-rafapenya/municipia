package com.municipia.api.application.port.in;

import com.municipia.api.domain.model.User;
import java.util.List;

public interface ListUsersUseCase {
    List<User> listByMunicipality(Long municipalityId);
}
