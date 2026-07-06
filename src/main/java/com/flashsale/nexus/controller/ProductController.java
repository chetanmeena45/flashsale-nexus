package com.flashsale.nexus.controller;

import com.flashsale.nexus.entity.Product;
import com.flashsale.nexus.service.ProductService;
import com.flashsale.nexus.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    // Constructor Injection is best practice
    public ProductController(ProductService productService, ProductRepository productRepository) {
        this.productService = productService;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        // Now using our cached service method
        return productService.getProductById(id);
    }

    @PostMapping("/{id}/purchase")
    public Product purchaseProduct(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        // You would eventually move this purchase logic to a service as well
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @PutMapping
    public Product updateProduct(@RequestBody Product product) {
        return productService.updateProduct(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}