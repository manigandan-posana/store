package com.store.demo.service.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConsoleNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(ConsoleNotificationService.class);

    @Override
    public void sendBackofficeCredentials(String email, String password) {
        log.info("Sending backoffice credentials to {} with password {}", email, password);
    }
}
