package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.UpdateUserProfileCommand;
import com.neria_municipio.api.application.port.in.UpdateUserProfileUseCase;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.User;
import org.springframework.stereotype.Service;

@Service
public class UpdateUserProfileService implements UpdateUserProfileUseCase {
    private final UserPort userPort;

    public UpdateUserProfileService(UserPort userPort) {
        this.userPort = userPort;
    }

    @Override
    public User updateProfile(UpdateUserProfileCommand command) {
        User existing = userPort.findById(command.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!existing.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        boolean hasFullName = command.fullName() != null && !command.fullName().isBlank();
        boolean hasEmail = command.email() != null && !command.email().isBlank();
        boolean hasAvatar = command.avatarUrl() != null && !command.avatarUrl().isBlank();

        if (!hasFullName && !hasEmail && !hasAvatar) {
            throw new IllegalArgumentException("No fields to update");
        }

        String nextFullName = hasFullName ? command.fullName() : existing.fullName();
        String nextEmail = hasEmail ? command.email() : existing.email();
        String nextAvatar = hasAvatar ? command.avatarUrl() : existing.avatarUrl();

        if (!nextEmail.equalsIgnoreCase(existing.email())) {
            userPort.findByEmail(nextEmail)
                    .filter(found -> !found.id().equals(existing.id()))
                    .ifPresent(found -> {
                        throw new IllegalArgumentException("Email already in use");
                    });
        }

        User updated = new User(
                existing.id(),
                existing.municipalityId(),
                nextFullName,
                nextEmail,
                nextAvatar,
                existing.passwordHash(),
                existing.role()
        );

        return userPort.save(updated);
    }
}
