package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.DeleteNewsCommand;
import com.neria_municipio.api.application.port.in.DeleteNewsUseCase;
import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import org.springframework.stereotype.Service;

@Service
public class DeleteNewsService implements DeleteNewsUseCase {
    private final NewsPort newsPort;

    public DeleteNewsService(NewsPort newsPort) {
        this.newsPort = newsPort;
    }

    @Override
    public void deleteNews(DeleteNewsCommand command) {
        News existing = newsPort.findById(command.newsId())
                .orElseThrow(() -> new IllegalArgumentException("News not found"));

        if (!existing.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        newsPort.deleteById(existing.id());
    }
}
