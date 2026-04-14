package com.neria_municipio.api.infrastructure.adapter.out.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neria_municipio.api.application.port.out.AiChatPort;
import com.neria_municipio.api.domain.model.ChatMessage;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.codec.ServerSentEvent;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class OpenAiChatAdapter implements AiChatPort {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient;
    private final String apiKey;
    private final String defaultModel;
    private final String baseUrl;

    public OpenAiChatAdapter(
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-4.1-mini}") String defaultModel,
            @Value("${openai.base-url:https://api.openai.com/v1}") String baseUrl
    ) {
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
        this.baseUrl = baseUrl;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    @Override
    public AiChatResult chat(String model, double temperature, List<ChatMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key not configured");
        }
        String effectiveModel = (model != null && !model.isBlank()) ? model : defaultModel;

        Map<String, Object> request = new HashMap<>();
        request.put("model", effectiveModel);
        request.put("temperature", temperature);
        request.put("input", messages.stream()
                .map(message -> Map.of(
                        "role", message.role(),
                        "content", message.content()
                ))
                .toList());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        String response = restTemplate.postForObject(baseUrl + "/responses", entity, String.class);
        if (response == null) {
            throw new IllegalArgumentException("Empty response from OpenAI");
        }
        String reply = parseResponse(response);
        return new AiChatResult(reply, effectiveModel);
    }

    @Override
    public Flux<String> chatStream(String model, double temperature, List<ChatMessage> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            return Flux.error(new IllegalArgumentException("OpenAI API key not configured"));
        }
        String effectiveModel = (model != null && !model.isBlank()) ? model : defaultModel;

        Map<String, Object> request = new HashMap<>();
        request.put("model", effectiveModel);
        request.put("temperature", temperature);
        request.put("stream", true);
        request.put("input", messages.stream()
                .map(message -> Map.of(
                        "role", message.role(),
                        "content", message.content()
                ))
                .toList());

        ParameterizedTypeReference<ServerSentEvent<String>> typeRef =
                new ParameterizedTypeReference<>() {};

        return webClient.post()
                .uri("/responses")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(request)
                .retrieve()
                .bodyToFlux(typeRef)
                .flatMap(this::extractDelta)
                .filter(delta -> !delta.isBlank());
    }

    private Mono<String> extractDelta(ServerSentEvent<String> event) {
        String data = event.data();
        if (data == null || data.isBlank() || "[DONE]".equals(data)) {
            return Mono.empty();
        }

        try {
            JsonNode payload = objectMapper.readTree(data);
            String type = payload.path("type").asText();
            if ("response.error".equals(type)) {
                String message = payload.path("error").path("message").asText("OpenAI streaming error");
                return Mono.error(new IllegalArgumentException(message));
            }
            if (!"response.output_text.delta".equals(type)) {
                return Mono.empty();
            }
            String delta = payload.path("delta").asText("");
            if (delta.isBlank()) {
                return Mono.empty();
            }
            return Mono.just(delta);
        } catch (IOException ex) {
            return Mono.error(new IllegalArgumentException("OpenAI stream parse failed", ex));
        }
    }

    private String parseResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.hasNonNull("output_text")) {
                return root.get("output_text").asText();
            }

            JsonNode output = root.path("output");
            if (output.isArray() && output.size() > 0) {
                StringBuilder builder = new StringBuilder();
                for (JsonNode item : output) {
                    JsonNode content = item.path("content");
                    if (content.isArray()) {
                        for (JsonNode part : content) {
                            if ("output_text".equals(part.path("type").asText())) {
                                builder.append(part.path("text").asText());
                            }
                        }
                    }
                }
                String resolved = builder.toString().trim();
                if (!resolved.isBlank()) {
                    return resolved;
                }
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("OpenAI response parse failed", ex);
        }

        throw new IllegalArgumentException("OpenAI response missing output_text");
    }
}
