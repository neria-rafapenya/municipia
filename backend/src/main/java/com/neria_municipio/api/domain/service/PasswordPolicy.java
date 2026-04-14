package com.neria_municipio.api.domain.service;

import java.util.ArrayList;
import java.util.List;

public final class PasswordPolicy {
    private PasswordPolicy() {
    }

    public static void validate(String password) {
        List<String> errors = new ArrayList<>();
        if (password == null || password.isBlank()) {
            errors.add("Password is required");
        } else {
            if (password.length() < 8) {
                errors.add("Password must be at least 8 characters");
            }
            if (!password.chars().anyMatch(Character::isLetter)) {
                errors.add("Password must include a letter");
            }
            if (!password.chars().anyMatch(Character::isDigit)) {
                errors.add("Password must include a number");
            }
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join(". ", errors));
        }
    }
}
