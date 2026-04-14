package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.PasswordResetPort;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.PasswordResetEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.PasswordResetRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class PasswordResetPersistenceAdapter implements PasswordResetPort {
    private final PasswordResetRepository passwordResetRepository;
    private final UserRepository userRepository;

    public PasswordResetPersistenceAdapter(
            PasswordResetRepository passwordResetRepository,
            UserRepository userRepository
    ) {
        this.passwordResetRepository = passwordResetRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PasswordResetRecord create(Long userId, String token, Instant expiresAt) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        PasswordResetEntity entity = new PasswordResetEntity();
        entity.setUser(user);
        entity.setToken(token);
        entity.setExpiresAt(expiresAt);
        return toRecord(passwordResetRepository.save(entity));
    }

    @Override
    public Optional<PasswordResetRecord> findByToken(String token) {
        return passwordResetRepository.findByToken(token).map(this::toRecord);
    }

    @Override
    public PasswordResetRecord markUsed(Long id, Instant usedAt) {
        PasswordResetEntity entity = passwordResetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reset token not found"));
        entity.setUsedAt(usedAt);
        return toRecord(passwordResetRepository.save(entity));
    }

    private PasswordResetRecord toRecord(PasswordResetEntity entity) {
        return new PasswordResetRecord(
                entity.getId(),
                entity.getUser().getId(),
                entity.getToken(),
                entity.getExpiresAt(),
                entity.getUsedAt()
        );
    }
}
