package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.application.port.out.AiClassificationPort.AiClassificationResult;
import java.util.List;

public interface ClassifyIncidentUseCase {
    AiClassificationResult classify(String description, List<String> categories);
}
