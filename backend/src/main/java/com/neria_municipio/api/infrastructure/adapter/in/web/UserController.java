package com.neria_municipio.api.infrastructure.adapter.in.web;

import com.neria_municipio.api.application.port.in.ChangePasswordCommand;
import com.neria_municipio.api.application.port.in.ChangePasswordUseCase;
import com.neria_municipio.api.application.port.in.ListUsersUseCase;
import com.neria_municipio.api.application.port.in.RegisterUserCommand;
import com.neria_municipio.api.application.port.in.RegisterUserUseCase;
import com.neria_municipio.api.application.port.in.UpdateUserProfileCommand;
import com.neria_municipio.api.application.port.in.UpdateUserProfileUseCase;
import com.neria_municipio.api.domain.model.UserRole;
import com.neria_municipio.api.domain.model.User;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.ChangePasswordRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.RegisterUserRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.UserUpdateRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.UserResponse;
import com.neria_municipio.api.infrastructure.adapter.out.storage.CloudinaryUploadService;
import com.neria_municipio.api.infrastructure.adapter.out.storage.CloudinaryUploadService.UploadedFile;
import com.neria_municipio.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private static final long MAX_AVATAR_BYTES = 15L * 1024 * 1024;
    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private static final Set<String> ALLOWED_AVATAR_EXTENSIONS = Set.of(
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif"
    );

    private final RegisterUserUseCase registerUserUseCase;
    private final ListUsersUseCase listUsersUseCase;
    private final UpdateUserProfileUseCase updateUserProfileUseCase;
    private final ChangePasswordUseCase changePasswordUseCase;
    private final CloudinaryUploadService cloudinaryUploadService;

    public UserController(
            RegisterUserUseCase registerUserUseCase,
            ListUsersUseCase listUsersUseCase,
            UpdateUserProfileUseCase updateUserProfileUseCase,
            ChangePasswordUseCase changePasswordUseCase,
            CloudinaryUploadService cloudinaryUploadService
    ) {
        this.registerUserUseCase = registerUserUseCase;
        this.listUsersUseCase = listUsersUseCase;
        this.updateUserProfileUseCase = updateUserProfileUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.cloudinaryUploadService = cloudinaryUploadService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Long>> register(@Valid @RequestBody RegisterUserRequest request) {
        Long userId = registerUserUseCase.registerUser(new RegisterUserCommand(
                request.municipalityId(),
                request.fullName(),
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
                .map(user -> new UserResponse(
                        user.id(),
                        user.municipalityId(),
                        user.fullName(),
                        user.email(),
                        user.avatarUrl(),
                        user.role()
                ))
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        JwtPrincipal principal = requirePrincipal();
        UserResponse response = listUsersUseCase
                .listByMunicipality(principal.municipalityId())
                .stream()
                .filter(user -> user.id().equals(principal.userId()))
                .findFirst()
                .map(user -> new UserResponse(
                        user.id(),
                        user.municipalityId(),
                        user.fullName(),
                        user.email(),
                        user.avatarUrl(),
                        user.role()
                ))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        JwtPrincipal principal = requirePrincipal();

        User updated = updateUserProfileUseCase.updateProfile(new UpdateUserProfileCommand(
                principal.userId(),
                principal.municipalityId(),
                request.fullName(),
                request.email(),
                null
        ));

        return ResponseEntity.ok(new UserResponse(
                updated.id(),
                updated.municipalityId(),
                updated.fullName(),
                updated.email(),
                updated.avatarUrl(),
                updated.role()
        ));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateAvatar(@RequestParam("file") MultipartFile file) {
        JwtPrincipal principal = requirePrincipal();
        validateAvatarFile(file);

        UploadedFile uploaded = cloudinaryUploadService.uploadAvatar(
                file,
                "avatar-" + principal.userId()
        );

        User updated = updateUserProfileUseCase.updateProfile(new UpdateUserProfileCommand(
                principal.userId(),
                principal.municipalityId(),
                null,
                null,
                uploaded.url()
        ));

        return ResponseEntity.ok(new UserResponse(
                updated.id(),
                updated.municipalityId(),
                updated.fullName(),
                updated.email(),
                updated.avatarUrl(),
                updated.role()
        ));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        JwtPrincipal principal = requirePrincipal();
        changePasswordUseCase.changePassword(new ChangePasswordCommand(
                principal.userId(),
                principal.municipalityId(),
                request.currentPassword(),
                request.newPassword()
        ));
        return ResponseEntity.noContent().build();
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }

    private void validateAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar exceeds 15MB");
        }
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        if (!isAllowedAvatarType(contentType, filename)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagen no permitido");
        }
    }

    private boolean isAllowedAvatarType(String contentType, String filename) {
        if (contentType != null && ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase())) {
            return true;
        }
        if (filename == null || !filename.contains(".")) {
            return false;
        }
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return ALLOWED_AVATAR_EXTENSIONS.contains(ext);
    }
}
