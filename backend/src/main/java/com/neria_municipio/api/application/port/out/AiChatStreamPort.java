package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.ChatMessage;
import java.util.List;
import reactor.core.publisher.Flux;

public interface AiChatStreamPort {
    Flux<String> stream(String model, double temperature, List<ChatMessage> messages);
}
