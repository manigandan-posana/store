package com.store.demo.web;

import com.store.demo.domain.UserAccount;
import com.store.demo.service.InventoryService;
import com.store.demo.service.UserAccountService;
import com.store.demo.service.notification.NotificationService;
import com.store.demo.service.dto.InventoryMovementReportDto;
import com.store.demo.web.dto.CreateBackofficeUserRequest;
import com.store.demo.web.dto.CreateBackofficeUserResponse;
import com.store.demo.web.dto.InventoryAnalyticsResponse;
import com.store.demo.web.dto.UserResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserAccountService userAccountService;
    private final NotificationService notificationService;
    private final InventoryService inventoryService;

    public AdminController(
            UserAccountService userAccountService,
            NotificationService notificationService,
            InventoryService inventoryService) {
        this.userAccountService = userAccountService;
        this.notificationService = notificationService;
        this.inventoryService = inventoryService;
    }

    @GetMapping("/users")
    public List<UserResponse> getBackofficeUsers() {
        return userAccountService.findBackofficeUsers().stream()
                .map(userAccountService::toResponse)
                .toList();
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateBackofficeUserResponse createBackofficeUser(@Valid @RequestBody CreateBackofficeUserRequest request) {
        String password = userAccountService.generateTemporaryPassword();
        UserAccount account = userAccountService.createBackofficeUser(request.email(), request.displayName(), password);
        notificationService.sendBackofficeCredentials(account.getEmail(), password);
        return new CreateBackofficeUserResponse(userAccountService.toResponse(account), password);
    }

    @GetMapping("/analytics/inventory")
    public InventoryAnalyticsResponse getInventoryAnalytics() {
        return inventoryService.getInventoryAnalytics();
    }

    @GetMapping("/analytics/movements")
    public InventoryMovementReportDto getInventoryMovementReport(
            @RequestParam(value = "projectId", required = false) Long projectId) {
        return inventoryService.getInventoryMovementReport(projectId);
    }
}
