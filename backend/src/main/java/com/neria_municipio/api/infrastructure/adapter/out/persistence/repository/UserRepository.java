package com.neria_municipio.api.infrastructure.adapter.out.persistence.repository;

import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByMunicipality_Id(Long municipalityId);
}
