package com.store.demo.web;

import com.store.demo.domain.UserAccount;
import com.store.demo.security.JwtService;
import com.store.demo.service.UserAccountService;
import com.store.demo.web.error.BadRequestException;
import com.store.demo.web.dto.ChangePasswordRequest;
import com.store.demo.web.dto.LoginRequest;
import com.store.demo.web.dto.LoginResponse;
import com.store.demo.web.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserAccountService userAccountService;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserAccountService userAccountService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userAccountService = userAccountService;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails principal = (UserDetails) authentication.getPrincipal();
        UserAccount account = userAccountService.getByEmail(principal.getUsername());
        if (!account.isActive()) {
            throw new BadRequestException("User account is disabled");
        }
        userAccountService.recordLogin(account);
        String token = jwtService.generateToken(account);
        return new LoginResponse(token, userAccountService.toResponse(account));
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new IllegalStateException("Unauthenticated");
        }
        UserAccount account = userAccountService.getByEmail(principal.getUsername());
        return userAccountService.toResponse(account);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    public void changePassword(Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            throw new IllegalStateException("Unauthenticated");
        }
        if (request.newPassword().equals(request.currentPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }
        UserAccount account = userAccountService.getByEmail(principal.getUsername());
        userAccountService.changePassword(account, request.currentPassword(), request.newPassword());
    }
}
