package com.aequivault.infrastructure.web.dto;

import java.util.UUID;

public class LoginResponse {
    private String token;
    private String email;
    private UUID tenantId;

    public LoginResponse() {}

    public LoginResponse(String token, String email, UUID tenantId) {
        this.token = token;
        this.email = email;
        this.tenantId = tenantId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public UUID getTenantId() {
        return tenantId;
    }

    public void setTenantId(UUID tenantId) {
        this.tenantId = tenantId;
    }
}
