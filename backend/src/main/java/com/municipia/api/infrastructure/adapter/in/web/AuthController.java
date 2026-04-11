package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.AuthToken;
import com.municipia.api.application.port.in.LoginCommand;
import com.municipia.api.application.port.in.LoginUseCase;
import com.municipia.api.application.port.in.RequestPasswordResetCommand;
import com.municipia.api.application.port.in.RequestPasswordResetUseCase;
import com.municipia.api.application.port.in.ResetPasswordCommand;
import com.municipia.api.application.port.in.ResetPasswordUseCase;
import com.municipia.api.domain.model.UserRole;
import com.municipia.api.infrastructure.adapter.in.web.dto.LoginRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.PasswordResetConfirmRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.PasswordResetRequest;
import com.municipia.api.infrastructure.adapter.in.web.dto.TokenResponse;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import com.municipia.api.infrastructure.security.JwtService;
import java.util.Objects;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final LoginUseCase loginUseCase;
    private final JwtService jwtService;
    private final RequestPasswordResetUseCase requestPasswordResetUseCase;
    private final ResetPasswordUseCase resetPasswordUseCase;

    public AuthController(
            LoginUseCase loginUseCase,
            JwtService jwtService,
            RequestPasswordResetUseCase requestPasswordResetUseCase,
            ResetPasswordUseCase resetPasswordUseCase
    ) {
        this.loginUseCase = loginUseCase;
        this.jwtService = jwtService;
        this.requestPasswordResetUseCase = requestPasswordResetUseCase;
        this.resetPasswordUseCase = resetPasswordUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthToken token = loginUseCase.login(new LoginCommand(request.email(), request.password()));
        return ResponseEntity.ok(TokenResponse.of(token.accessToken(), token.expiresAt()));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        RequestPasswordResetUseCase.ResetToken token = requestPasswordResetUseCase.request(
                new RequestPasswordResetCommand(request.email())
        );
        return ResponseEntity.ok(token);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        resetPasswordUseCase.reset(new ResetPasswordCommand(request.token(), request.newPassword()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication != null ? authentication.getPrincipal() : null;

        if (!(principal instanceof JwtPrincipal jwtPrincipal)) {
            return ResponseEntity.status(401).build();
        }

        UserRole role = Objects.requireNonNull(jwtPrincipal.role(), "role");
        AuthToken token = jwtService.issueToken(
                jwtPrincipal.userId(),
                jwtPrincipal.municipalityId(),
                jwtPrincipal.email(),
                role
        );
        return ResponseEntity.ok(TokenResponse.of(token.accessToken(), token.expiresAt()));
    }
}
