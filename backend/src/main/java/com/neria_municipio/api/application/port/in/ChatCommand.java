package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.ChatMessage;
import java.util.List;

public record ChatCommand(
        Long municipalityId,
        Long userId,
        String message,
        List<ChatMessage> history
) {
}
