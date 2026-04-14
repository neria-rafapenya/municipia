package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.UpdateNewsCommand;
import com.neria_municipio.api.application.port.in.UpdateNewsUseCase;
import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import org.springframework.stereotype.Service;

@Service
public class UpdateNewsService implements UpdateNewsUseCase {
    private final NewsPort newsPort;

    public UpdateNewsService(NewsPort newsPort) {
        this.newsPort = newsPort;
    }

    @Override
    public News updateNews(UpdateNewsCommand command) {
        News existing = newsPort.findById(command.newsId())
                .orElseThrow(() -> new IllegalArgumentException("News not found"));

        if (!existing.municipalityId().equals(command.municipalityId())) {
            throw new IllegalArgumentException("Municipality mismatch");
        }

        String title = command.title() != null ? command.title() : existing.title();
        String summary = command.summary() != null ? command.summary() : existing.summary();
        String content = command.content() != null ? command.content() : existing.content();
        String imageUrl = command.imageUrl() != null ? command.imageUrl() : existing.imageUrl();
        boolean active = command.active() != null ? command.active() : existing.active();

        News updated = new News(
                existing.id(),
                existing.municipalityId(),
                title,
                summary,
                content,
                imageUrl,
                active
        );

        return newsPort.save(updated);
    }
}
