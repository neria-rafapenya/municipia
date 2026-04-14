package com.neria_municipio.api.application.port.in;

public interface ChatUseCase {
    ChatResult chat(ChatCommand command);
}
