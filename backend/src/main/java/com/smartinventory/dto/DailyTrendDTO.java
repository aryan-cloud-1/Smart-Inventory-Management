package com.smartinventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTrendDTO {
    private String date;
    private String transactionType;
    private Long totalQuantity;
}
