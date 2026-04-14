package com.neria_municipio.api.application.port.out;

import java.util.List;

public interface AiClassificationPort {
    AiClassificationResult classify(String description, List<String> categories);

    record AiClassificationResult(String categoryName, float confidence) {
    }
}
