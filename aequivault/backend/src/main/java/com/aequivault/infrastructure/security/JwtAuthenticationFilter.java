package com.aequivault.infrastructure.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    if (!jwtService.isTokenExpired(token)) {
                        String email = jwtService.extractEmail(token);
                        UUID tenantId = jwtService.extractTenantId(token);
                        List<String> roles = jwtService.extractRoles(token);

                        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                            List<SimpleGrantedAuthority> authorities = roles.stream()
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toUnmodifiableList());

                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    email, null, authorities
                            );
                            SecurityContextHolder.getContext().setAuthentication(authToken);

                            if (tenantId != null) {
                                TenantContext.setTenantId(tenantId.toString());
                            }
                        }
                    }
                } catch (Exception e) {
                    SecurityContextHolder.clearContext();
                    TenantContext.clear();
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
