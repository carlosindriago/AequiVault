package com.aequivault.infrastructure.demo;

import com.aequivault.infrastructure.persistence.repository.TenantRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "demo.ephemeral.enabled", havingValue = "true")
public class EphemeralDemoGarbageCollector {

    private final TenantRepository tenantRepository;

    public EphemeralDemoGarbageCollector(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Scheduled(fixedRateString = "${demo.ephemeral.gc-rate-ms:900000}", initialDelayString = "${demo.ephemeral.gc-initial-delay-ms:0}")
    public void deleteExpiredTenants() {
        tenantRepository.deleteExpiredTenants();
    }
}
