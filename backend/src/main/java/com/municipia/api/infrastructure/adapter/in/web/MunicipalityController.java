package com.municipia.api.infrastructure.adapter.in.web;

import com.municipia.api.application.port.in.GetMunicipalityUseCase;
import com.municipia.api.domain.model.Municipality;
import com.municipia.api.domain.model.UserRole;
import com.municipia.api.infrastructure.adapter.in.web.dto.MunicipalityResponse;
import com.municipia.api.infrastructure.security.JwtPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/municipalities")
public class MunicipalityController {
    private final GetMunicipalityUseCase getMunicipalityUseCase;

    public MunicipalityController(GetMunicipalityUseCase getMunicipalityUseCase) {
        this.getMunicipalityUseCase = getMunicipalityUseCase;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MunicipalityResponse> getMunicipality(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        if (!UserRole.ADMIN.equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        if (!id.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        Municipality municipality = getMunicipalityUseCase.getMunicipality(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Municipality not found"));

        MunicipalityResponse response = new MunicipalityResponse(
                municipality.id(),
                municipality.name(),
                municipality.postalCode(),
                municipality.configJson()
        );
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
