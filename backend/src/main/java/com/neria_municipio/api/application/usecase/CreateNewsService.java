package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.CreateNewsCommand;
import com.neria_municipio.api.application.port.in.CreateNewsUseCase;
import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import org.springframework.stereotype.Service;

@Service
public class CreateNewsService implements CreateNewsUseCase {
    private final NewsPort newsPort;

    public CreateNewsService(NewsPort newsPort) {
        this.newsPort = newsPort;
    }

    @Override
    public News createNews(CreateNewsCommand command) {
        News news = new News(
                null,
                command.municipalityId(),
                command.title(),
                command.summary(),
                command.content(),
                command.imageUrl(),
                true
        );
        return newsPort.save(news);
    }
}
