package com.neria_municipio.api.infrastructure.adapter.out.persistence;

import com.neria_municipio.api.application.port.out.NewsPort;
import com.neria_municipio.api.domain.model.News;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.MunicipalityEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.entity.NewsEntity;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.MunicipalityRepository;
import com.neria_municipio.api.infrastructure.adapter.out.persistence.repository.NewsRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class NewsPersistenceAdapter implements NewsPort {
    private final NewsRepository newsRepository;
    private final MunicipalityRepository municipalityRepository;

    public NewsPersistenceAdapter(
            NewsRepository newsRepository,
            MunicipalityRepository municipalityRepository
    ) {
        this.newsRepository = newsRepository;
        this.municipalityRepository = municipalityRepository;
    }

    @Override
    public Optional<News> findById(Long id) {
        return newsRepository.findById(id).map(PersistenceMapper::toDomain);
    }

    @Override
    public List<News> findByMunicipalityId(Long municipalityId) {
        return newsRepository.findByMunicipality_IdOrderByCreatedAtDesc(municipalityId).stream()
                .map(PersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public News save(News news) {
        NewsEntity entity = newsRepository.findById(news.id() != null ? news.id() : -1L)
                .orElseGet(NewsEntity::new);
        MunicipalityEntity municipality = municipalityRepository.findById(news.municipalityId())
                .orElseThrow(() -> new IllegalArgumentException("Municipality not found"));

        entity.setId(news.id());
        entity.setMunicipality(municipality);
        entity.setTitle(news.title());
        entity.setSummary(news.summary());
        entity.setContent(news.content());
        entity.setImageUrl(news.imageUrl());
        entity.setActive(news.active());

        return PersistenceMapper.toDomain(newsRepository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        newsRepository.deleteById(id);
    }
}
