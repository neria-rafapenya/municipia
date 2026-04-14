package com.neria_municipio.api.infrastructure.adapter.out.ai;

import com.neria_municipio.api.application.port.out.ChatPromptTemplatePort;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class ClasspathChatPromptTemplateAdapter implements ChatPromptTemplatePort {
    private final ResourceLoader resourceLoader;
    private final String promptFile;

    public ClasspathChatPromptTemplateAdapter(
            ResourceLoader resourceLoader,
            @Value("${app.chat.prompt-file:classpath:prompts/chat_assistant.md}") String promptFile
    ) {
        this.resourceLoader = resourceLoader;
        this.promptFile = promptFile;
    }

    @Override
    public String loadDefaultPrompt() {
        Resource resource = resourceLoader.getResource(promptFile);
        try {
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to load chat prompt", ex);
        }
    }
}
