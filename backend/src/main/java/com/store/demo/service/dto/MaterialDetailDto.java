package com.store.demo.service.dto;

import java.util.List;

public record MaterialDetailDto(
        ProjectDto project,
        MaterialDto material,
        MaterialStatsDto stats,
        List<MovementDto> inwards,
        List<MovementDto> outwards,
        List<MovementDto> history) {}
