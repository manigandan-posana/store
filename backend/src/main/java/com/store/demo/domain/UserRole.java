package com.store.demo.domain;

public enum UserRole {
    ADMIN,
    BACKOFFICE;

    public String asSpringRole() {
        return "ROLE_" + name();
    }
}
