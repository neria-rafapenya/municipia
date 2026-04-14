package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.User;
import java.util.List;

public interface ListUsersUseCase {
    List<User> listByMunicipality(Long municipalityId);
}
