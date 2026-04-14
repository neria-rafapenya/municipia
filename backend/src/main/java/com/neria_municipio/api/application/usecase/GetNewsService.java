package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.GetNewsUseCase;
import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import org.springframework.stereotype.Service;

@Service
public class GetNewsService implements GetNewsUseCase {
    private final NewsPort newsPort;

    public GetNewsService(NewsPort newsPort) {
        this.newsPort = newsPort;
    }

    @Override
    public News getById(Long id) {
        return newsPort.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("News not found"));
    }
}
