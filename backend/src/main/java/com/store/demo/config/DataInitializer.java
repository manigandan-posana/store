package com.store.demo.config;

import com.store.demo.service.UserAccountService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserAccountService userAccountService;

    public DataInitializer(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @PostConstruct
    public void init() {
        userAccountService.ensureAdminUser("admin@vebops.com", "Inventory Admin", "vebops");
        log.info("Ensured default admin user exists: admin@vebops.com");
    }
}
