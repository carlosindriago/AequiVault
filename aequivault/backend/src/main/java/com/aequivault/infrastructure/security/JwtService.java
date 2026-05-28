package com.aequivault.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*;

@Service
public class JwtService {

    @Value("${security.jwt.secret:dGVzdC1zZWNyZXQta2V5LXdpdGgtYXQtbGVhc3QtMjU2LWJpdHMtbGVuZ3RoLXNlY3VyZQ==}")
    private String secretKey;

    @Value("${security.jwt.expiration-ms:86400000}")
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, UUID tenantId, Set<String> roles) {
        return Jwts.builder()
                .subject(email)
                .claim("tenantId", tenantId.toString())
                .claim("roles", new ArrayList<>(roles))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public UUID extractTenantId(String token) {
        String tenantIdStr = extractAllClaims(token).get("tenantId", String.class);
        return tenantIdStr != null ? UUID.fromString(tenantIdStr) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractAllClaims(token).get("roles", List.class);
    }

    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean isTokenValid(String token, String email) {
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email)) && !isTokenExpired(token);
    }
}
