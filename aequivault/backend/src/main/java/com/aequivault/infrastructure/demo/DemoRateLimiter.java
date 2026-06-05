package com.aequivault.infrastructure.demo;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;

@Component
public class DemoRateLimiter {

    private final int maxRequests;
    private final Duration window;
    private final Clock clock;
    private final Cache<String, Deque<Instant>> attemptsByIp;

    public DemoRateLimiter(@Value("${demo.ephemeral.rate-limit.max-per-hour:2}") int maxRequests,
                           @Value("${demo.ephemeral.rate-limit.idle-evict-hours:4}") long idleEvictHours,
                           Clock clock) {
        this.maxRequests = maxRequests;
        this.window = Duration.ofHours(1);
        this.clock = clock;
        // Caffeine performs time-based eviction automatically so that IPs that
        // stop making requests do not leak memory in a long-running process.
        this.attemptsByIp = Caffeine.newBuilder()
                .expireAfterAccess(Duration.ofHours(idleEvictHours))
                .maximumSize(100_000)
                .build();
    }

    public boolean tryAcquire(String ipAddress) {
        Instant now = clock.instant();
        Instant cutoff = now.minus(window);

        Deque<Instant> attempts = attemptsByIp.get(ipAddress, ignored -> new ArrayDeque<>());
        synchronized (attempts) {
            while (!attempts.isEmpty() && attempts.peekFirst().isBefore(cutoff)) {
                attempts.removeFirst();
            }
            if (attempts.size() >= maxRequests) {
                return false;
            }
            attempts.addLast(now);
            return true;
        }
    }
}
