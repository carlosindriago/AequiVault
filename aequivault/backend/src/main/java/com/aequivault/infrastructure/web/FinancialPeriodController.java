package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.FinancialPeriodService;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/periods")
public class FinancialPeriodController {

    private final FinancialPeriodService periodService;

    public FinancialPeriodController(FinancialPeriodService periodService) {
        this.periodService = periodService;
    }

    @PostMapping("/{year}/{month}/close")
    public ResponseEntity<Void> closePeriod(@PathVariable int year, @PathVariable int month) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        periodService.closePeriod(tenantId, year, month, "SYSTEM_USER");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{year}/{month}/open")
    public ResponseEntity<Void> openPeriod(@PathVariable int year, @PathVariable int month) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        periodService.openPeriod(tenantId, year, month);
        return ResponseEntity.ok().build();
    }
}
