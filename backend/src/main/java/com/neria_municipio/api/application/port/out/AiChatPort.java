package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.ChatMessage;
import java.util.List;
import reactor.core.publisher.Flux;

public interface AiChatPort {
    AiChatResult chat(String model, double temperature, List<ChatMessage> messages);
    Flux<String> chatStream(String model, double temperature, List<ChatMessage> messages);

    record AiChatResult(String reply, String model) {
    }
}
