package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ClassifyIncidentUseCase;
import com.neria_municipio.api.application.port.out.AiClassificationPort;
import com.neria_municipio.api.application.port.out.AiClassificationPort.AiClassificationResult;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ClassifyIncidentService implements ClassifyIncidentUseCase {
    private final AiClassificationPort aiClassificationPort;

    public ClassifyIncidentService(AiClassificationPort aiClassificationPort) {
        this.aiClassificationPort = aiClassificationPort;
    }

    @Override
    public AiClassificationResult classify(String description, List<String> categories) {
        return aiClassificationPort.classify(description, categories);
    }
}
