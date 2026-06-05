package com.aequivault.infrastructure.demo;

import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "demo.ephemeral.enabled=true",
        "demo.ephemeral.gc-initial-delay-ms=3600000"
})
@AutoConfigureMockMvc
class DemoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TenantRepository tenantRepository;

    private final List<UUID> createdTenantIds = new ArrayList<>();

    @AfterEach
    void tearDown() {
        for (UUID tenantId : createdTenantIds) {
            tenantRepository.deleteById(tenantId);
        }
    }

    @Test
    void startDemoCreatesExpiringTenantAndReturnsCredentials() throws Exception {
        String response = mockMvc.perform(post("/api/demo/start")
                        .header("X-Forwarded-For", "203.0.113.44"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tenantName", startsWith("Demo - ")))
                .andExpect(jsonPath("$.expiresAt").isNotEmpty())
                .andExpect(jsonPath("$.credentials.email", startsWith("demo+")))
                .andExpect(jsonPath("$.credentials.password").isNotEmpty())
                .andExpect(jsonPath("$.credentials.role").value("SUPER_ADMIN"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String tenantId = response.replaceAll(".*\"tenantId\":\"([^\"]+)\".*", "$1");
        UUID parsedTenantId = UUID.fromString(tenantId);
        createdTenantIds.add(parsedTenantId);

        tenantRepository.findById(parsedTenantId)
                .ifPresentOrElse(
                        tenant -> {
                            org.assertj.core.api.Assertions.assertThat(tenant.getExpiresAt()).isNotNull();
                            org.assertj.core.api.Assertions.assertThat(tenant.getName()).startsWith("Demo - ");
                        },
                        () -> org.assertj.core.api.Assertions.fail("Demo tenant was not persisted")
                );
    }
}
