package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.ListUsersUseCase;
import com.municipia.api.application.port.in.RegisterUserCommand;
import com.municipia.api.application.port.in.RegisterUserUseCase;
import com.municipia.api.domain.model.UserRole;
import com.municipia.api.infrastructure.adapter.in.web.dto.RegisterUserRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.UserResponse;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final RegisterUserUseCase registerUserUseCase;
    private final ListUsersUseCase listUsersUseCase;

    public UserController(RegisterUserUseCase registerUserUseCase, ListUsersUseCase listUsersUseCase) {
        this.registerUserUseCase = registerUserUseCase;
        this.listUsersUseCase = listUsersUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Long>> register(@Valid @RequestBody RegisterUserRequest request) {
        Long userId = registerUserUseCase.registerUser(new RegisterUserCommand(
                request.municipalityId(),
                request.email(),
                request.password(),
                request.role()
        ));

        return ResponseEntity.ok(Map.of("id", userId));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers(
            @RequestParam(value = "municipalityId", required = false) Long municipalityId
    ) {
        JwtPrincipal principal = requirePrincipal();
        if (!UserRole.ADMIN.equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }

        Long effectiveMunicipalityId = municipalityId != null ? municipalityId : principal.municipalityId();
        if (!effectiveMunicipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        List<UserResponse> response = listUsersUseCase.listByMunicipality(effectiveMunicipalityId).stream()
                .map(user -> new UserResponse(user.id(), user.municipalityId(), user.email(), user.role()))
                .toList();
        return ResponseEntity.ok(response);
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }
}
