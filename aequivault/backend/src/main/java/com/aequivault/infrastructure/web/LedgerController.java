package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.LedgerReportDto;
import com.aequivault.domain.repository.ReportRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ledger")
public class LedgerController {

    private final ReportRepository reportRepository;

    public LedgerController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<LedgerReportDto> getLedgerReport(
            @PathVariable("accountId") UUID accountId,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Please provide X-Tenant-ID header.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        LedgerReportDto report = reportRepository.getLedgerReport(tenantId, accountId, startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
