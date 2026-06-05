package com.aequivault.infrastructure.demo;

public record DemoCredentials(
        String email,
        String password,
        String role
) {
}
