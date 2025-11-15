package com.store.demo.web;

import com.store.demo.service.MaterialService;
import com.store.demo.service.dto.CreateMaterialCommand;
import com.store.demo.service.dto.MaterialDto;
import com.store.demo.web.dto.CreateMaterialRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    public List<MaterialDto> listMaterials() {
        return materialService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('BACKOFFICE')")
    public MaterialDto createMaterial(@Valid @RequestBody CreateMaterialRequest request) {
        return materialService.create(new CreateMaterialCommand(
                request.name(),
                request.code(),
                request.unit(),
                request.category(),
                request.minimumStock(),
                request.defaultLocation()));
    }
}
