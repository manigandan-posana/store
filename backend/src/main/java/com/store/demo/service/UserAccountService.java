package com.store.demo.service;

import com.store.demo.domain.UserAccount;
import com.store.demo.domain.UserRole;
import com.store.demo.repository.UserAccountRepository;
import com.store.demo.service.mapper.DtoMapper;
import com.store.demo.web.dto.UserResponse;
import com.store.demo.web.error.BadRequestException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserAccountService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserAccountRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final DtoMapper mapper;

    public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder, DtoMapper mapper) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    public UserAccount ensureAdminUser(String email, String displayName, String rawPassword) {
        return repository
                .findByEmailIgnoreCase(email)
                .map(existing -> {
                    if (!passwordEncoder.matches(rawPassword, existing.getPasswordHash())) {
                        existing.setPasswordHash(passwordEncoder.encode(rawPassword));
                    }
                    if (existing.getRole() != UserRole.ADMIN) {
                        existing.setRole(UserRole.ADMIN);
                    }
                    existing.setDisplayName(displayName);
                    existing.setActive(true);
                    existing.setUpdatedAt(mapper.now());
                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    UserAccount admin = new UserAccount();
                    admin.setEmail(email.toLowerCase(Locale.ENGLISH));
                    admin.setDisplayName(displayName);
                    admin.setRole(UserRole.ADMIN);
                    admin.setPasswordHash(passwordEncoder.encode(rawPassword));
                    admin.setActive(true);
                    admin.setCreatedAt(mapper.now());
                    admin.setUpdatedAt(mapper.now());
                    return repository.save(admin);
                });
    }

    public UserAccount createBackofficeUser(String email, String name, String rawPassword) {
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("User with email already exists");
        }
        UserAccount account = new UserAccount();
        account.setEmail(email.toLowerCase(Locale.ENGLISH));
        account.setDisplayName(name);
        account.setRole(UserRole.BACKOFFICE);
        account.setPasswordHash(passwordEncoder.encode(rawPassword));
        account.setActive(true);
        account.setCreatedAt(mapper.now());
        account.setUpdatedAt(mapper.now());
        return repository.save(account);
    }

    public void updatePassword(UserAccount account, String rawPassword) {
        account.setPasswordHash(passwordEncoder.encode(rawPassword));
        account.setUpdatedAt(mapper.now());
        repository.save(account);
    }

    public void changePassword(UserAccount account, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(newPassword, account.getPasswordHash())) {
            throw new BadRequestException("New password must be different from current password");
        }
        updatePassword(account, newPassword);
    }

    public List<UserAccount> findBackofficeUsers() {
        return repository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.BACKOFFICE)
                .toList();
    }

    public long countByRole(UserRole role) {
        return repository.countByRole(role);
    }

    public UserAccount getByEmail(String email) {
        return repository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public UserAccount getById(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public UserAccount updateStatus(Long id, boolean active) {
        UserAccount account = getById(id);
        account.setActive(active);
        account.setUpdatedAt(mapper.now());
        return repository.save(account);
    }

    public PasswordReset resetPassword(Long id) {
        UserAccount account = getById(id);
        String password = generateTemporaryPassword();
        updatePassword(account, password);
        return new PasswordReset(account, password);
    }

    public void recordLogin(UserAccount account) {
        account.setLastLoginAt(mapper.now());
        account.setUpdatedAt(mapper.now());
        repository.save(account);
    }

    public String generateTemporaryPassword() {
        byte[] random = new byte[6];
        RANDOM.nextBytes(random);
        return HexFormat.of().formatHex(random);
    }

    public UserResponse toResponse(UserAccount account) {
        return new UserResponse(
                account.getId(),
                account.getEmail(),
                account.getDisplayName(),
                account.getRole(),
                account.isActive(),
                account.getLastLoginAt(),
                account.getCreatedAt(),
                account.getUpdatedAt());
    }

    public record PasswordReset(UserAccount account, String temporaryPassword) {}
}
