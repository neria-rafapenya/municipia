package com.neria_municipio.api.application.port.in;

import reactor.core.publisher.Flux;

public interface ChatStreamUseCase {
    Flux<String> chatStream(ChatCommand command);
}
