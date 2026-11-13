package com.smartinventory.controller;

import com.smartinventory.service.ReportExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Report Exports", description = "Export capabilities for inventory and movement reports to PDF & CSV")
public class ReportController {

    private final ReportExportService reportExportService;

    @GetMapping("/inventory/csv")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Export Inventory to CSV")
    public ResponseEntity<InputStreamResource> exportInventoryCsv() {
        ByteArrayInputStream in = reportExportService.exportInventoryToCsv();
        String filename = "inventory_report_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/inventory/pdf")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Export Inventory to PDF")
    public ResponseEntity<InputStreamResource> exportInventoryPdf() {
        ByteArrayInputStream in = reportExportService.exportInventoryToPdf();
        String filename = "inventory_valuation_" + LocalDate.now() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }

    @GetMapping("/transactions/csv")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Export Transactions Audit Trail to CSV")
    public ResponseEntity<InputStreamResource> exportTransactionsCsv() {
        ByteArrayInputStream in = reportExportService.exportTransactionsToCsv();
        String filename = "transactions_audit_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }
}
