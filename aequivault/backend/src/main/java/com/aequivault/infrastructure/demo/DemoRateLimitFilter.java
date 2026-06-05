package com.aequivault.infrastructure.demo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@ConditionalOnProperty(name = "demo.ephemeral.enabled", havingValue = "true")
public class DemoRateLimitFilter extends OncePerRequestFilter {

    private final DemoRateLimiter rateLimiter;
    private final DemoClientIpResolver clientIpResolver;

    public DemoRateLimitFilter(DemoRateLimiter rateLimiter, DemoClientIpResolver clientIpResolver) {
        this.rateLimiter = rateLimiter;
        this.clientIpResolver = clientIpResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (isDemoStartRequest(request)) {
            String ipAddress = clientIpResolver.resolve(request);
            if (!rateLimiter.tryAcquire(ipAddress)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Demo creation rate limit exceeded. Try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isDemoStartRequest(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod())
                && "/api/demo/start".equals(request.getRequestURI());
    }
}
