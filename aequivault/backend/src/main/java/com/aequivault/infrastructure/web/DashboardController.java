package com.aequivault.infrastructure.web;

import com.aequivault.domain.model.DailyBalanceDto;
import com.aequivault.domain.model.DashboardDto;
import com.aequivault.domain.repository.ReportRepository;
import com.aequivault.infrastructure.security.TenantContext;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final ReportRepository reportRepository;

    public DashboardController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboardData(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam("cashAccountId") UUID cashAccountId
    ) {
        String tenantStr = TenantContext.getTenantId();
        if (tenantStr == null || tenantStr.isBlank()) {
            throw new IllegalStateException("Tenant context is missing. Unauthenticated request.");
        }
        UUID tenantId = UUID.fromString(tenantStr);

        BigDecimal totalAssets = reportRepository.getNetBalanceForGroupPath(tenantId, "1");
        BigDecimal totalLiabilities = reportRepository.getNetBalanceForGroupPath(tenantId, "2");
        BigDecimal netEquity = totalAssets.subtract(totalLiabilities);
        List<DailyBalanceDto> liquidityTrend = reportRepository.getDailyBalances(tenantId, cashAccountId, startDate, endDate);

        DashboardDto dashboardData = new DashboardDto(
            totalAssets,
            totalLiabilities,
            netEquity,
            liquidityTrend
        );

        return ResponseEntity.ok(dashboardData);
    }
}
