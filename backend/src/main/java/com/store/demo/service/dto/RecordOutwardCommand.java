package com.store.demo.service.dto;

import java.time.LocalDate;

public record RecordOutwardCommand(
        Long projectId,
        Long materialId,
        double quantity,
        LocalDate handoverDate,
        String handoverName,
        String handoverDesignation,
        String storeInchargeName,
        String remarks) {}
