package com.neria_municipio.api.application.usecase;

import com.neria_municipio.api.application.port.in.ListNewsUseCase;
import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListNewsService implements ListNewsUseCase {
    private final NewsPort newsPort;

    public ListNewsService(NewsPort newsPort) {
        this.newsPort = newsPort;
    }

    @Override
    public List<News> listByMunicipality(Long municipalityId) {
        return newsPort.findByMunicipalityId(municipalityId);
    }
}
