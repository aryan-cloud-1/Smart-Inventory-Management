package com.smartinventory.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartinventory.entity.InventoryTransaction;
import com.smartinventory.entity.Product;
import com.smartinventory.repository.InventoryTransactionRepository;
import com.smartinventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportInventoryToCsv() {
        List<Product> products = productRepository.findByIsActiveTrue();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out),
                     CSVFormat.DEFAULT.builder().setHeader(
                             "ID", "SKU", "Barcode", "Name", "Category", "Supplier",
                             "Unit Cost", "Selling Price", "Current Stock", "Min Threshold",
                             "Total Cost Valuation", "Storage Location", "Status"
                     ).build())) {

            for (Product p : products) {
                BigDecimal totalVal = p.getUnitCost().multiply(BigDecimal.valueOf(p.getCurrentStock()));
                csvPrinter.printRecord(
                        p.getId(),
                        p.getSku(),
                        p.getBarcode() != null ? p.getBarcode() : "",
                        p.getName(),
                        p.getCategory() != null ? p.getCategory().getName() : "",
                        p.getSupplier() != null ? p.getSupplier().getCompanyName() : "",
                        p.getUnitCost(),
                        p.getSellingPrice(),
                        p.getCurrentStock(),
                        p.getMinThreshold(),
                        totalVal,
                        p.getStorageLocation(),
                        p.isLowStock() ? "LOW_STOCK" : "NORMAL"
                );
            }
            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export inventory to CSV: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportInventoryToPdf() {
        List<Product> products = productRepository.findByIsActiveTrue();
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Smart Inventory Valuation & Stock Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph dateGenerated = new Paragraph("Generated at: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), subFont);
            dateGenerated.setAlignment(Element.ALIGN_CENTER);
            dateGenerated.setSpacingAfter(15);
            document.add(dateGenerated);

            // Table setup
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{3.0f, 4.5f, 3.0f, 2.0f, 2.2f, 2.5f, 2.2f});

            // Table Header Cells
            String[] headers = {"SKU", "Product Name", "Category", "Stock", "Unit Cost", "Valuation", "Status"};
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(new Color(30, 41, 59)); // Slate-800
                cell.setPadding(6);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Table Data Rows
            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font alertFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(185, 28, 28));

            for (Product p : products) {
                BigDecimal val = p.getUnitCost().multiply(BigDecimal.valueOf(p.getCurrentStock()));

                table.addCell(new Phrase(p.getSku(), rowFont));
                table.addCell(new Phrase(p.getName(), rowFont));
                table.addCell(new Phrase(p.getCategory() != null ? p.getCategory().getName() : "-", rowFont));
                table.addCell(new Phrase(String.valueOf(p.getCurrentStock()), rowFont));
                table.addCell(new Phrase("$" + p.getUnitCost().setScale(2, BigDecimal.ROUND_HALF_UP), rowFont));
                table.addCell(new Phrase("$" + val.setScale(2, BigDecimal.ROUND_HALF_UP), rowFont));

                if (p.isLowStock()) {
                    table.addCell(new Phrase("LOW STOCK", alertFont));
                } else {
                    table.addCell(new Phrase("OK", rowFont));
                }
            }

            document.add(table);
            document.close();

        } catch (DocumentException e) {
            log.error("Error generating PDF: {}", e.getMessage());
            throw new RuntimeException("PDF generation error", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportTransactionsToCsv() {
        List<InventoryTransaction> transactions = transactionRepository.findAll();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out),
                     CSVFormat.DEFAULT.builder().setHeader(
                             "Transaction ID", "SKU", "Product Name", "Type",
                             "Quantity", "Previous Balance", "New Balance",
                             "Reference No", "Operator", "Timestamp"
                     ).build())) {

            for (InventoryTransaction tx : transactions) {
                csvPrinter.printRecord(
                        tx.getId(),
                        tx.getProduct().getSku(),
                        tx.getProduct().getName(),
                        tx.getTransactionType().name(),
                        tx.getQuantity(),
                        tx.getPreviousBalance(),
                        tx.getNewBalance(),
                        tx.getReferenceNumber() != null ? tx.getReferenceNumber() : "",
                        tx.getOperator().getUsername(),
                        tx.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                );
            }
            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export transactions to CSV: " + e.getMessage(), e);
        }
    }
}
