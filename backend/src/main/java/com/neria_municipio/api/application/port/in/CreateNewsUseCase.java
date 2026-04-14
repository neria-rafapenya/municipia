package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.News;

public interface CreateNewsUseCase {
    News createNews(CreateNewsCommand command);
}
