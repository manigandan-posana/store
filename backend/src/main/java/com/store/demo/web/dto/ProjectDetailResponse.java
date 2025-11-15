package com.store.demo.web.dto;

import com.store.demo.service.dto.MaterialStatsDto;
import com.store.demo.service.dto.ProjectDto;
import java.util.List;

public record ProjectDetailResponse(ProjectDto project, List<MaterialStatsDto> materials) {}
