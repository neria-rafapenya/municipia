package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.News;

public interface UpdateNewsUseCase {
    News updateNews(UpdateNewsCommand command);
}
