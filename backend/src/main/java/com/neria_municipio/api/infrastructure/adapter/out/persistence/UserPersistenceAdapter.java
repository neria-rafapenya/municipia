package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.User;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class UserPersistenceAdapter implements UserPort {
    private final UserRepository userRepository;
    private final MunicipalityRepository municipalityRepository;

    public UserPersistenceAdapter(UserRepository userRepository, MunicipalityRepository municipalityRepository) {
        this.userRepository = userRepository;
        this.municipalityRepository = municipalityRepository;
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id).map(PersistenceMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email).map(PersistenceMapper::toDomain);
    }

    @Override
    public List<User> findByMunicipalityId(Long municipalityId) {
        return userRepository.findByMunicipality_Id(municipalityId).stream()
                .map(PersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public User save(User user) {
        MunicipalityEntity municipality = municipalityRepository.findById(user.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));

        UserEntity entity = new UserEntity();
        entity.setId(user.id());
        entity.setMunicipality(municipality);
        entity.setFullName(user.fullName());
        entity.setEmail(user.email());
        entity.setAvatarUrl(user.avatarUrl());
        entity.setPasswordHash(user.passwordHash());
        entity.setRole(user.role());

        return PersistenceMapper.toDomain(userRepository.save(entity));
    }
}
