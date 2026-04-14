package com.neria_municipio.api.application.port.out;

import com.neria_municipio.api.domain.model.ChatbotLog;

public interface ChatbotLogPort {
    void save(ChatbotLog log);
}
