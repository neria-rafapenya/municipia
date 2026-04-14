package com.neria_municipio.api.infrastructure.adapter.out.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neria_municipio.api.application.port.out.AiClassificationPort;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OpenAiClassificationAdapter implements AiClassificationPort {
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ResourceLoader resourceLoader;
    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final String outputFormat;
    private final String promptFile;
    private final double temperature;

    public OpenAiClassificationAdapter(
            ResourceLoader resourceLoader,
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-4.1-mini}") String model,
            @Value("${openai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${app.ai.output-format:json_object}") String outputFormat,
            @Value("${app.ai.prompt-file:classpath:prompts/wizard.md}") String promptFile,
            @Value("${app.ai.temperature:0.2}") double temperature
    ) {
        this.resourceLoader = resourceLoader;
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.outputFormat = outputFormat;
        this.promptFile = promptFile;
        this.temperature = temperature;
    }

    @Override
    public AiClassificationResult classify(String description, List<String> categories) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key not configured");
        }

        String systemPrompt = loadPrompt();
        String userPrompt = buildUserPrompt(description, categories);

        Map<String, Object> request = new HashMap<>();
        request.put("model", model);
        request.put("temperature", temperature);
        request.put("input", List.of(
                Map.of(
                        "role", "system",
                        "content", systemPrompt
                ),
                Map.of(
                        "role", "user",
                        "content", userPrompt
                )
        ));
        request.put("text", Map.of("format", Map.of("type", outputFormat)));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
        String response = restTemplate.postForObject(baseUrl + "/responses", entity, String.class);
        if (response == null) {
            throw new IllegalArgumentException("Empty response from OpenAI");
        }

        return parseResponse(response);
    }

    private AiClassificationResult parseResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.hasNonNull("output_text")) {
                return parseClassification(root.get("output_text").asText());
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
                return parseClassification(builder.toString());
            }
        } catch (IOException ex) {
            throw new IllegalArgumentException("OpenAI response parse failed", ex);
        }

        throw new IllegalArgumentException("OpenAI response missing output_text");
    }

    private AiClassificationResult parseClassification(String outputText) throws IOException {
        JsonNode node = objectMapper.readTree(outputText);
        String category = node.path("category").asText(null);
        float confidence = (float) node.path("confidence").asDouble(0.0);
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("OpenAI classification missing category");
        }
        return new AiClassificationResult(category, confidence);
    }

    private String buildUserPrompt(String description, List<String> categories) {
        String joined = String.join(", ", categories);
        return "Classify the following incident into one of these categories: [" + joined + "].\n"
                + "Return a JSON object with keys 'category' and 'confidence' (0-1).\n"
                + "Incident description: " + description;
    }

    private String loadPrompt() {
        Resource resource = resourceLoader.getResource(promptFile);
        try {
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to load AI prompt", ex);
        }
    }
}
