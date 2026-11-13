package com.smartinventory.service.impl;

import com.smartinventory.dto.EOQSuggestionDTO;
import com.smartinventory.dto.ProductCreateRequest;
import com.smartinventory.dto.ProductDTO;
import com.smartinventory.entity.Category;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.Supplier;
import com.smartinventory.exception.BadRequestException;
import com.smartinventory.exception.ResourceNotFoundException;
import com.smartinventory.repository.CategoryRepository;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.SupplierRepository;
import com.smartinventory.service.AlertNotificationService;
import com.smartinventory.service.AuditLogService;
import com.smartinventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;
    private final AlertNotificationService alertNotificationService;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(String search, Long categoryId, Pageable pageable) {
        Page<Product> products;
        if (StringUtils.hasText(search)) {
            products = productRepository.searchProducts(search.trim(), pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductById(String id) {
        Product product = findProductById(id);
        return mapToDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        return mapToDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "barcode", barcode));
        return mapToDTO(product);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductCreateRequest request, String currentUsername) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists!");
        }

        if (StringUtils.hasText(request.getBarcode()) && productRepository.existsByBarcode(request.getBarcode())) {
            throw new BadRequestException("Product with barcode '" + request.getBarcode() + "' already exists!");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Supplier supplier = null;
        if (StringUtils.hasText(request.getSupplierId())) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }

        Product product = Product.builder()
                .sku(request.getSku())
                .barcode(request.getBarcode())
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .supplier(supplier)
                .unitCost(request.getUnitCost())
                .sellingPrice(request.getSellingPrice())
                .currentStock(request.getCurrentStock())
                .minThreshold(request.getMinThreshold())
                .reorderQuantity(request.getReorderQuantity())
                .annualDemand(request.getAnnualDemand())
                .orderCost(request.getOrderCost())
                .holdingCostPercent(request.getHoldingCostPercent())
                .storageLocation(request.getStorageLocation())
                .unitOfMeasure(request.getUnitOfMeasure())
                .isActive(true)
                .build();

        Product saved = productRepository.save(product);

        if (saved.isLowStock()) {
            alertNotificationService.sendLowStockAlert(saved, saved.calculateEconomicOrderQuantity());
        }

        auditLogService.recordAction("PRODUCT", saved.getId(), "CREATE", currentUsername, null,
                "Created product SKU: " + saved.getSku() + ", Initial Stock: " + saved.getCurrentStock());

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(String id, ProductCreateRequest request, String currentUsername) {
        Product product = findProductById(id);

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists!");
        }

        if (StringUtils.hasText(request.getBarcode()) &&
                !request.getBarcode().equals(product.getBarcode()) &&
                productRepository.existsByBarcode(request.getBarcode())) {
            throw new BadRequestException("Product with barcode '" + request.getBarcode() + "' already exists!");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Supplier supplier = null;
        if (StringUtils.hasText(request.getSupplierId())) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
        }

        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setUnitCost(request.getUnitCost());
        product.setSellingPrice(request.getSellingPrice());
        product.setCurrentStock(request.getCurrentStock());
        product.setMinThreshold(request.getMinThreshold());
        product.setReorderQuantity(request.getReorderQuantity());
        product.setAnnualDemand(request.getAnnualDemand());
        product.setOrderCost(request.getOrderCost());
        product.setHoldingCostPercent(request.getHoldingCostPercent());
        product.setStorageLocation(request.getStorageLocation());
        product.setUnitOfMeasure(request.getUnitOfMeasure());

        Product updated = productRepository.save(product);

        auditLogService.recordAction("PRODUCT", updated.getId(), "UPDATE", currentUsername, null,
                "Updated product SKU: " + updated.getSku());

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(String id, String currentUsername) {
        Product product = findProductById(id);
        product.setIsActive(false); // Soft delete
        productRepository.save(product);

        auditLogService.recordAction("PRODUCT", product.getId(), "SOFT_DELETE", currentUsername, null,
                "Deactivated product SKU: " + product.getSku());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EOQSuggestionDTO> getLowStockReorderSuggestions() {
        List<Product> lowStockProducts = productRepository.findLowStockProducts();
        return lowStockProducts.stream().map(p -> {
            int eoq = p.calculateEconomicOrderQuantity();
            BigDecimal estimatedCost = p.getUnitCost().multiply(BigDecimal.valueOf(eoq));
            return EOQSuggestionDTO.builder()
                    .productId(p.getId())
                    .sku(p.getSku())
                    .productName(p.getName())
                    .currentStock(p.getCurrentStock())
                    .minThreshold(p.getMinThreshold())
                    .suggestedReorderQuantity(eoq)
                    .annualDemand(p.getAnnualDemand())
                    .unitCost(p.getUnitCost())
                    .orderCost(p.getOrderCost())
                    .holdingCostPercent(p.getHoldingCostPercent())
                    .estimatedTotalOrderCost(estimatedCost)
                    .supplierName(p.getSupplier() != null ? p.getSupplier().getCompanyName() : "N/A")
                    .supplierEmail(p.getSupplier() != null ? p.getSupplier().getEmail() : "N/A")
                    .build();
        }).collect(Collectors.toList());
    }

    private Product findProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductDTO mapToDTO(Product p) {
        BigDecimal totalCostVal = p.getUnitCost().multiply(BigDecimal.valueOf(p.getCurrentStock()));
        BigDecimal totalRetailVal = p.getSellingPrice().multiply(BigDecimal.valueOf(p.getCurrentStock()));

        return ProductDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .barcode(p.getBarcode())
                .name(p.getName())
                .description(p.getDescription())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .supplierId(p.getSupplier() != null ? p.getSupplier().getId() : null)
                .supplierName(p.getSupplier() != null ? p.getSupplier().getCompanyName() : null)
                .unitCost(p.getUnitCost())
                .sellingPrice(p.getSellingPrice())
                .currentStock(p.getCurrentStock())
                .minThreshold(p.getMinThreshold())
                .reorderQuantity(p.getReorderQuantity())
                .annualDemand(p.getAnnualDemand())
                .orderCost(p.getOrderCost())
                .holdingCostPercent(p.getHoldingCostPercent())
                .storageLocation(p.getStorageLocation())
                .unitOfMeasure(p.getUnitOfMeasure())
                .isActive(p.getIsActive())
                .isLowStock(p.isLowStock())
                .suggestedEoq(p.calculateEconomicOrderQuantity())
                .totalCostValue(totalCostVal)
                .totalRetailValue(totalRetailVal)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
