package com.store.demo.web;

import com.store.demo.service.DashboardService;
import com.store.demo.service.dto.ProjectDashboardDto;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','BACKOFFICE')")
    public ProjectDashboardDto getDashboard(@RequestParam(value = "projectId", required = false) Long projectId) {
        return dashboardService.getDashboard(projectId);
    }
}
