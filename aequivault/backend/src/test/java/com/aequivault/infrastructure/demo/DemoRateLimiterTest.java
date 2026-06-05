package com.aequivault.infrastructure.demo;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

class DemoRateLimiterTest {

    @Test
    void rejectsRequestsBeyondHourlyLimitForSameIp() {
        DemoRateLimiter limiter = new DemoRateLimiter(2, 4, Clock.fixed(Instant.parse("2026-06-03T12:00:00Z"), ZoneOffset.UTC));

        assertThat(limiter.tryAcquire("203.0.113.10")).isTrue();
        assertThat(limiter.tryAcquire("203.0.113.10")).isTrue();
        assertThat(limiter.tryAcquire("203.0.113.10")).isFalse();
    }

    @Test
    void tracksDifferentIpsIndependently() {
        DemoRateLimiter limiter = new DemoRateLimiter(1, 4, Clock.fixed(Instant.parse("2026-06-03T12:00:00Z"), ZoneOffset.UTC));

        assertThat(limiter.tryAcquire("203.0.113.10")).isTrue();
        assertThat(limiter.tryAcquire("198.51.100.20")).isTrue();
        assertThat(limiter.tryAcquire("203.0.113.10")).isFalse();
    }
}
