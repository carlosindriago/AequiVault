package com.aequivault.infrastructure.demo;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class DemoClientIpResolver {

    public String resolve(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] candidates = forwardedFor.split(",");
            for (String candidate : candidates) {
                String normalized = normalize(candidate);
                if (!normalized.isBlank()) {
                    return normalized;
                }
            }
        }

        String realIp = normalize(request.getHeader("X-Real-IP"));
        if (!realIp.isBlank()) {
            return realIp;
        }

        return normalize(request.getRemoteAddr());
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        String trimmed = value.trim();
        if (trimmed.startsWith("[") && trimmed.contains("]")) {
            return trimmed.substring(1, trimmed.indexOf(']'));
        }

        int lastColon = trimmed.lastIndexOf(':');
        if (lastColon > 0 && trimmed.indexOf(':') == lastColon) {
            String possiblePort = trimmed.substring(lastColon + 1);
            if (possiblePort.chars().allMatch(Character::isDigit)) {
                return trimmed.substring(0, lastColon);
            }
        }

        return trimmed;
    }
}
