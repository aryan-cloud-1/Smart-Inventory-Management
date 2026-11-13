package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.EOQSuggestionDTO;
import com.smartinventory.dto.ProductCreateRequest;
import com.smartinventory.dto.ProductDTO;
import com.smartinventory.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Product Catalog", description = "Endpoints for managing products, barcodes, stock thresholds, and EOQ calculations")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "List/Search Products", description = "Retrieve paginated products with optional keyword and category filtering")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProductDTO> products = productService.getAllProducts(search, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Product by ID")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductById(@PathVariable String id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Find Product by SKU")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductBySku(@PathVariable String sku) {
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/barcode/{barcode}")
    @Operation(summary = "Barcode/QR Code Lookup")
    public ResponseEntity<ApiResponse<ProductDTO>> getProductByBarcode(@PathVariable String barcode) {
        ProductDTO product = productService.getProductByBarcode(barcode);
        return ResponseEntity.ok(ApiResponse.ok(product));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "List Low Stock Products", description = "Fetch all products whose current stock is at or below safety threshold")
    public ResponseEntity<ApiResponse<List<ProductDTO>>> getLowStockProducts() {
        List<ProductDTO> lowStock = productService.getLowStockProducts();
        return ResponseEntity.ok(ApiResponse.ok(lowStock));
    }

    @GetMapping("/reorder-suggestions")
    @Operation(summary = "Economic Order Quantity (EOQ) Suggestions", description = "Calculate dynamic EOQ reorder suggestions for low stock inventory")
    public ResponseEntity<ApiResponse<List<EOQSuggestionDTO>>> getReorderSuggestions() {
        List<EOQSuggestionDTO> suggestions = productService.getLowStockReorderSuggestions();
        return ResponseEntity.ok(ApiResponse.ok(suggestions));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Create Product", description = "Create a new catalog item (Requires Manager or Admin)")
    public ResponseEntity<ApiResponse<ProductDTO>> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        ProductDTO created = productService.createProduct(request, currentUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Product created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Update Product", description = "Modify product catalog properties (Requires Manager or Admin)")
    public ResponseEntity<ApiResponse<ProductDTO>> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        ProductDTO updated = productService.updateProduct(id, request, currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Deactivate Product", description = "Soft delete / deactivate product from catalog")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails currentUser) {
        productService.deleteProduct(id, currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Product successfully deactivated", null));
    }
}
