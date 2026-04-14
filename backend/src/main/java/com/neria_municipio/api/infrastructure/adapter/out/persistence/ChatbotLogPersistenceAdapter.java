package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.ChatbotLogPort;
import com.neria_municipio.api.domain.model.ChatbotLog;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.ChatbotLogEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.ChatbotLogRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.stereotype.Repository;

@Repository
public class ChatbotLogPersistenceAdapter implements ChatbotLogPort {
    private final ChatbotLogRepository chatbotLogRepository;
    private final MunicipalityRepository municipalityRepository;
    private final UserRepository userRepository;

    public ChatbotLogPersistenceAdapter(
            ChatbotLogRepository chatbotLogRepository,
            MunicipalityRepository municipalityRepository,
            UserRepository userRepository
    ) {
        this.chatbotLogRepository = chatbotLogRepository;
        this.municipalityRepository = municipalityRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void save(ChatbotLog log) {
        MunicipalityEntity municipality = municipalityRepository.findById(log.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));
        UserEntity user = userRepository.findById(log.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChatbotLogEntity entity = new ChatbotLogEntity();
        entity.setMunicipality(municipality);
        entity.setUser(user);
        entity.setPrompt(log.prompt());
        entity.setResponse(log.response());
        chatbotLogRepository.save(entity);
    }
}
