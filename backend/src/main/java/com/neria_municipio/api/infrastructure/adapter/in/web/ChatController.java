package com.neria_municipio.api.infrastructure.adapter.in.web;

import com.neria_municipio.api.application.port.in.ChatCommand;
import com.neria_municipio.api.application.port.in.ChatResult;
import com.neria_municipio.api.application.port.in.ChatStreamUseCase;
import com.neria_municipio.api.application.port.in.ChatUseCase;
import com.neria_municipio.api.domain.model.ChatMessage;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.ChatMessageRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.ChatRequest;
import com.neria_municipio.api.infrastructure.adapter.in.web.dto.ChatResponse;
import com.neria_municipio.api.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.scheduler.Schedulers;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final ChatUseCase chatUseCase;
    private final ChatStreamUseCase chatStreamUseCase;

    public ChatController(ChatUseCase chatUseCase, ChatStreamUseCase chatStreamUseCase) {
        this.chatUseCase = chatUseCase;
        this.chatStreamUseCase = chatStreamUseCase;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        JwtPrincipal principal = requirePrincipal();
        List<ChatMessage> history = mapHistory(request.history());

        ChatResult result = chatUseCase.chat(new ChatCommand(
                principal.municipalityId(),
                principal.userId(),
                request.message(),
                history
        ));

        return ResponseEntity.ok(new ChatResponse(result.reply(), result.model()));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(@Valid @RequestBody ChatRequest request) {
        JwtPrincipal principal = requirePrincipal();
        List<ChatMessage> history = mapHistory(request.history());

        ChatCommand command = new ChatCommand(
                principal.municipalityId(),
                principal.userId(),
                request.message(),
                history
        );

        SseEmitter emitter = new SseEmitter(0L);
        chatStreamUseCase.chatStream(command)
                .publishOn(Schedulers.boundedElastic())
                .subscribe(
                        delta -> {
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("delta")
                                        .data(Map.of("delta", delta)));
                            } catch (Exception ex) {
                                emitter.completeWithError(ex);
                            }
                        },
                        emitter::completeWithError,
                        () -> {
                            try {
                                emitter.send(SseEmitter.event()
                                        .name("done")
                                        .data(Map.of("done", true)));
                            } catch (Exception ignored) {
                                // ignore send errors on completion
                            }
                            emitter.complete();
                        }
                );

        return emitter;
    }

    private List<ChatMessage> mapHistory(List<ChatMessageRequest> history) {
        if (history == null || history.isEmpty()) {
            return Collections.emptyList();
        }
        return history.stream()
                .map(item -> new ChatMessage(item.role(), item.content()))
                .toList();
    }

    private JwtPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return principal;
    }
}
