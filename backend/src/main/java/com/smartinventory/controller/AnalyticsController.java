package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.CategoryDistributionDTO;
import com.smartinventory.dto.DailyTrendDTO;
import com.smartinventory.dto.DashboardSummaryDTO;
import com.smartinventory.dto.FastMovingItemDTO;
import com.smartinventory.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & Reports", description = "Real-time metrics, valuation KPIs, fast-moving items, and inventory trends")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Get Dashboard Summary", description = "Comprehensive aggregated metrics for main analytics view")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        DashboardSummaryDTO summary = analyticsService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/fast-moving")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Get Fast-Moving Items", description = "Identifies high turnover products based on recent dispatches")
    public ResponseEntity<ApiResponse<List<FastMovingItemDTO>>> getFastMovingItems(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "10") int limit) {
        List<FastMovingItemDTO> items = analyticsService.getFastMovingItems(days, limit);
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get Category Breakdown", description = "Product count and total stock units grouped by category")
    public ResponseEntity<ApiResponse<List<CategoryDistributionDTO>>> getCategoryDistribution() {
        List<CategoryDistributionDTO> distribution = analyticsService.getCategoryDistribution();
        return ResponseEntity.ok(ApiResponse.ok(distribution));
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Get Movement Trends", description = "Historical movement daily trends for charts")
    public ResponseEntity<ApiResponse<List<DailyTrendDTO>>> getDailyTrends(
            @RequestParam(defaultValue = "30") int days) {
        List<DailyTrendDTO> trends = analyticsService.getDailyMovementTrends(days);
        return ResponseEntity.ok(ApiResponse.ok(trends));
    }
}
