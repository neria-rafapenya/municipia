package com.neria_municipio.api.application.port.in;

import com.neria_municipio.api.domain.model.News;
import java.util.List;

public interface ListNewsUseCase {
    List<News> listByMunicipality(Long municipalityId);
}
