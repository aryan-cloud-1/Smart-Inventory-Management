package com.smartinventory.service;

import com.smartinventory.dto.EOQSuggestionDTO;
import com.smartinventory.dto.ProductCreateRequest;
import com.smartinventory.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Page<ProductDTO> getAllProducts(String search, Long categoryId, Pageable pageable);
    ProductDTO getProductById(String id);
    ProductDTO getProductBySku(String sku);
    ProductDTO getProductByBarcode(String barcode);
    ProductDTO createProduct(ProductCreateRequest request, String currentUsername);
    ProductDTO updateProduct(String id, ProductCreateRequest request, String currentUsername);
    void deleteProduct(String id, String currentUsername);
    List<ProductDTO> getLowStockProducts();
    List<EOQSuggestionDTO> getLowStockReorderSuggestions();
}
