package com.smartinventory.service;

import com.smartinventory.dto.CategoryDistributionDTO;
import com.smartinventory.dto.DailyTrendDTO;
import com.smartinventory.dto.DashboardSummaryDTO;
import com.smartinventory.dto.FastMovingItemDTO;

import java.util.List;

public interface AnalyticsService {
    DashboardSummaryDTO getDashboardSummary();
    List<FastMovingItemDTO> getFastMovingItems(int daysLimit, int topCount);
    List<CategoryDistributionDTO> getCategoryDistribution();
    List<DailyTrendDTO> getDailyMovementTrends(int daysLimit);
}
