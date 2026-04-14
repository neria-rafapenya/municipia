package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.User;
import java.util.List;
import java.util.Optional;

public interface UserPort {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<User> findByMunicipalityId(Long municipalityId);
    User save(User user);
}
