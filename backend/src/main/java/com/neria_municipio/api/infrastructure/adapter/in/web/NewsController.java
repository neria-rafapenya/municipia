package com.neria_municipio.api.infrastructure.adapter.in.web;

import com.neria_municipio.api.application.port.in.CreateNewsCommand;
import com.neria_municipio.api.application.port.in.CreateNewsUseCase;
import com.neria_municipio.api.application.port.in.DeleteNewsCommand;
import com.neria_municipio.api.application.port.in.DeleteNewsUseCase;
import com.neria_municipio.api.application.port.in.GetNewsUseCase;
import com.neria_municipio.api.application.port.in.ListNewsUseCase;
import com.neria_municipio.api.application.port.in.UpdateNewsCommand;
import com.neria_municipio.api.application.port.in.UpdateNewsUseCase;
import com.neria_municipio.api.domain.model.News;
import com.neria_municipio.api.domain.model.UserRole;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.NewsCreateRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.NewsResponse;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.NewsUpdateRequest;
import com.neria_municipio.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/news")
@Validated
public class NewsController {
    private final ListNewsUseCase listNewsUseCase;
    private final GetNewsUseCase getNewsUseCase;
    private final CreateNewsUseCase createNewsUseCase;
    private final UpdateNewsUseCase updateNewsUseCase;
    private final DeleteNewsUseCase deleteNewsUseCase;

    public NewsController(
            ListNewsUseCase listNewsUseCase,
            GetNewsUseCase getNewsUseCase,
            CreateNewsUseCase createNewsUseCase,
            UpdateNewsUseCase updateNewsUseCase,
            DeleteNewsUseCase deleteNewsUseCase
    ) {
        this.listNewsUseCase = listNewsUseCase;
        this.getNewsUseCase = getNewsUseCase;
        this.createNewsUseCase = createNewsUseCase;
        this.updateNewsUseCase = updateNewsUseCase;
        this.deleteNewsUseCase = deleteNewsUseCase;
    }

    @GetMapping
    public ResponseEntity<List<NewsResponse>> listNews(
            @RequestParam(value = "municipalityId", required = false) Long municipalityId
    ) {
        JwtPrincipal principal = requirePrincipal();
        Long effectiveMunicipalityId = municipalityId != null ? municipalityId : principal.municipalityId();
        if (!effectiveMunicipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        List<NewsResponse> response = listNewsUseCase.listByMunicipality(effectiveMunicipalityId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NewsResponse> getNews(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        News news = getNewsUseCase.getById(id);
        if (!news.municipalityId().equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }
        return ResponseEntity.ok(toResponse(news));
    }

    @PostMapping
    public ResponseEntity<NewsResponse> createNews(@Valid @RequestBody NewsCreateRequest request) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        Long municipalityId = request.municipalityId();
        if (!municipalityId.equals(principal.municipalityId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Municipality access denied");
        }

        News created = createNewsUseCase.createNews(new CreateNewsCommand(
                municipalityId,
                request.title(),
                request.summary(),
                request.content(),
                request.imageUrl()
        ));
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsResponse> updateNews(
            @PathVariable Long id,
            @Valid @RequestBody NewsUpdateRequest request
    ) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        News updated = updateNewsUseCase.updateNews(new UpdateNewsCommand(
                id,
                principal.municipalityId(),
                request.title(),
                request.summary(),
                request.content(),
                request.imageUrl(),
                request.active()
        ));
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        JwtPrincipal principal = requirePrincipal();
        requireAdmin(principal);

        deleteNewsUseCase.deleteNews(new DeleteNewsCommand(id, principal.municipalityId()));
        return ResponseEntity.noContent().build();
    }

    private NewsResponse toResponse(News news) {
        return new NewsResponse(
                news.id(),
                news.municipalityId(),
                news.title(),
                news.summary(),
                news.content(),
                news.imageUrl(),
                news.active()
        );
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }

    private void requireAdmin(JwtPrincipal principal) {
        if (!UserRole.ADMIN.equals(principal.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
