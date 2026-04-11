package com.municipia.api.application.usecase;

import com.municipia.api.application.port.in.ListUsersUseCase;
import com.municipia.api.application.port.out.UserPort;
import com.municipia.api.domain.model.User;
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
