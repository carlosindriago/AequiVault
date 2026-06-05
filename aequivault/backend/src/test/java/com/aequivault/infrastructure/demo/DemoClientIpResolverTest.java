package com.aequivault.infrastructure.demo;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class DemoClientIpResolverTest {

    private final DemoClientIpResolver resolver = new DemoClientIpResolver();

    @Test
    void resolvesFirstForwardedForAddress() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.10, 10.0.0.4");
        request.setRemoteAddr("127.0.0.1");

        assertThat(resolver.resolve(request)).isEqualTo("203.0.113.10");
    }

    @Test
    void fallsBackToRemoteAddressWhenProxyHeadersAreMissing() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("198.51.100.20");

        assertThat(resolver.resolve(request)).isEqualTo("198.51.100.20");
    }
}
