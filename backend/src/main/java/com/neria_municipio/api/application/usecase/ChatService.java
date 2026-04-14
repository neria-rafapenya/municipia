package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ChatCommand;
import com.neria_municipio.api.application.port.in.ChatResult;
import com.neria_municipio.api.application.port.in.ChatStreamUseCase;
import com.neria_municipio.api.application.port.in.ChatUseCase;
import com.neria_municipio.api.application.port.out.AiChatPort;
import com.neria_municipio.api.application.port.out.AiPromptPort;
import com.neria_municipio.api.application.port.out.ChatPromptTemplatePort;
import com.neria_municipio.api.application.port.out.ChatbotLogPort;
import com.neria_municipio.api.application.port.out.MunicipalityPort;
import com.neria_municipio.api.application.port.out.UserPort;
import com.neria_municipio.api.domain.model.AiPrompt;
import com.neria_municipio.api.domain.model.ChatMessage;
import com.neria_municipio.api.domain.model.ChatbotLog;
import com.neria_municipio.api.domain.model.Municipality;
import com.neria_municipio.api.domain.model.User;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class ChatService implements ChatUseCase, ChatStreamUseCase {
    private static final String PROMPT_KEY = "CHAT_ASSISTANT";

    private final AiChatPort aiChatPort;
    private final AiPromptPort aiPromptPort;
    private final ChatPromptTemplatePort promptTemplatePort;
    private final ChatbotLogPort chatbotLogPort;
    private final MunicipalityPort municipalityPort;
    private final UserPort userPort;
    private final int defaultMaxHistory;
    private final double defaultTemperature;

    public ChatService(
            AiChatPort aiChatPort,
            AiPromptPort aiPromptPort,
            ChatPromptTemplatePort promptTemplatePort,
            ChatbotLogPort chatbotLogPort,
            MunicipalityPort municipalityPort,
            UserPort userPort,
            @Value("${app.ai.max-history:16}") int defaultMaxHistory,
            @Value("${app.ai.temperature:0.2}") double defaultTemperature
    ) {
        this.aiChatPort = aiChatPort;
        this.aiPromptPort = aiPromptPort;
        this.promptTemplatePort = promptTemplatePort;
        this.chatbotLogPort = chatbotLogPort;
        this.municipalityPort = municipalityPort;
        this.userPort = userPort;
        this.defaultMaxHistory = defaultMaxHistory;
        this.defaultTemperature = defaultTemperature;
    }

    @Override
    public ChatResult chat(ChatCommand command) {
        PreparedChat prepared = prepareChat(command);
        AiChatPort.AiChatResult result = aiChatPort.chat(prepared.model(), prepared.temperature(), prepared.messages());

        chatbotLogPort.save(new ChatbotLog(
                prepared.municipalityId(),
                prepared.userId(),
                prepared.logPrompt(),
                result.reply()
        ));

        return new ChatResult(result.reply(), result.model());
    }

    @Override
    public Flux<String> chatStream(ChatCommand command) {
        PreparedChat prepared = prepareChat(command);
        StringBuilder replyBuffer = new StringBuilder();

        return aiChatPort.chatStream(prepared.model(), prepared.temperature(), prepared.messages())
                .doOnNext(replyBuffer::append)
                .doOnComplete(() -> chatbotLogPort.save(new ChatbotLog(
                        prepared.municipalityId(),
                        prepared.userId(),
                        prepared.logPrompt(),
                        replyBuffer.toString()
                )));
    }

    private PreparedChat prepareChat(ChatCommand command) {
        if (command.message() == null || command.message().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }

        Municipality municipality = municipalityPort.findById(command.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
        User user = userPort.findById(command.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AiPrompt prompt = aiPromptPort.findByMunicipalityIdAndKey(municipality.id(), PROMPT_KEY).orElse(null);
        if (prompt != null && !prompt.enabled()) {
            prompt = null;
        }
        String systemPrompt = prompt != null && prompt.systemPrompt() != null && !prompt.systemPrompt().isBlank()
                ? prompt.systemPrompt()
                : promptTemplatePort.loadDefaultPrompt();
        String resolvedPrompt = applyTemplate(systemPrompt, municipality, user);

        int maxHistory = prompt != null && prompt.maxHistory() != null ? prompt.maxHistory() : defaultMaxHistory;
        double temperature = prompt != null && prompt.temperature() != null ? prompt.temperature() : defaultTemperature;
        String model = prompt != null ? prompt.model() : null;

        List<ChatMessage> history = trimHistory(command.history(), maxHistory);
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage("system", resolvedPrompt));
        messages.addAll(history);
        messages.add(new ChatMessage("user", command.message()));

        String logPrompt = buildLogPrompt(resolvedPrompt, history, command.message());

        return new PreparedChat(municipality.id(), user.id(), logPrompt, messages, model, temperature);
    }

    private record PreparedChat(
            Long municipalityId,
            Long userId,
            String logPrompt,
            List<ChatMessage> messages,
            String model,
            double temperature
    ) {
    }

    private List<ChatMessage> trimHistory(List<ChatMessage> history, int maxHistory) {
        if (history == null || history.isEmpty()) {
            return List.of();
        }
        if (maxHistory <= 0 || history.size() <= maxHistory) {
            return history;
        }
        return history.subList(history.size() - maxHistory, history.size());
    }

    private String applyTemplate(String template, Municipality municipality, User user) {
        Map<String, String> values = new HashMap<>();
        values.put("municipality_name", municipality.name());
        values.put("municipality_postal_code", municipality.postalCode());
        values.put("municipality_id", municipality.id() != null ? municipality.id().toString() : "");
        values.put("user_name", user.fullName());
        values.put("user_email", user.email());
        values.put("today", LocalDate.now().toString());

        String resolved = template;
        for (Map.Entry<String, String> entry : values.entrySet()) {
            String value = entry.getValue() != null ? entry.getValue() : "";
            resolved = resolved.replace("{{" + entry.getKey() + "}}", value);
        }
        return resolved;
    }

    private String buildLogPrompt(String systemPrompt, List<ChatMessage> history, String message) {
        StringBuilder builder = new StringBuilder();
        builder.append("SYSTEM: ").append(systemPrompt).append("\n");
        for (ChatMessage item : history) {
            builder.append(item.role().toUpperCase()).append(": ").append(item.content()).append("\n");
        }
        builder.append("USER: ").append(message);
        return builder.toString();
    }
}
