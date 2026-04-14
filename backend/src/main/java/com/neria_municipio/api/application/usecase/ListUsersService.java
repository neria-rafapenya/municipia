package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ListUsersUseCase;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.User;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListUsersService implements ListUsersUseCase {
    private final UserPort userPort;

    public ListUsersService(UserPort userPort) {
        this.userPort = userPort;
    }

    @Override
    public List<User> listByMunicipality(Long municipalityId) {
        return userPort.findByMunicipalityId(municipalityId);
    }
}
