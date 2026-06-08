package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.FinancialReportDto;
import com.aequivault.domain.model.TrialBalanceReportDto;
import com.aequivault.domain.repository.ReportRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<TrialBalanceReportDto> getTrialBalance(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        TrialBalanceReportDto report = reportRepository.generateTrialBalance(tenantId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<FinancialReportDto> getBalanceSheet(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        FinancialReportDto report = reportRepository.generateBalanceSheet(tenantId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/profit-and-loss")
    public ResponseEntity<FinancialReportDto> getProfitAndLoss(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        FinancialReportDto report = reportRepository.generateProfitAndLoss(tenantId, startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
