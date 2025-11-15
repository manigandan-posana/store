package com.store.demo.web;

import com.store.demo.service.MaterialService;
import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.MaterialSummaryDto;
import com.store.demo.web.dto.CreateMaterialRequest;
import com.store.demo.web.dto.UpdateMaterialRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    public List<MaterialSummaryDto> listMaterials() {
        return materialService.findAllWithStock();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public MaterialSummaryDto createMaterial(@Valid @RequestBody CreateMaterialRequest request) {
        return materialService.create(new CreateMaterialCommand(
                request.name(), request.code(), request.unit(), request.category(), request.initialQuantity()));
    }

    @PutMapping("/{materialId}")
    @PreAuthorize("hasRole('BACKOFFICE')")
    public MaterialSummaryDto updateMaterial(
            @PathVariable Long materialId, @Valid @RequestBody UpdateMaterialRequest request) {
        return materialService.update(
                materialId,
                new com.store.demo.service.dto.UpdateMaterialCommand(
                        request.name(), request.code(), request.unit(), request.category()));
    }

    @DeleteMapping("/{materialId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public void deleteMaterial(@PathVariable Long materialId) {
        materialService.delete(materialId);
    }
}
