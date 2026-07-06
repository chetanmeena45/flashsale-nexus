package com.flashsale.nexus.service;

import com.flashsale.nexus.entity.Product;
import com.flashsale.nexus.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * READ PATH: Uses Cache-Aside.
     * First checks Redis "products" region. On miss, queries PostgreSQL.
     */
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        log.info("CACHE MISS: Fetching product {} from PostgreSQL", id);
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    /**
     * WRITE PATH: Updates DB and refreshes cache atomically.
     */
    @CachePut(value = "products", key = "#product.id")
    @Transactional
    public Product updateProduct(Product product) {
        log.info("Updating product {} and refreshing cache", product.getId());
        return productRepository.save(product);
    }

    /**
     * ATOMIC DECREMENT: Ensures thread-safe stock reduction.
     */
    @Transactional
    public void decrementStock(Long productId, Integer quantity) {
        int updated = productRepository.decrementStock(productId, quantity);
        if (updated == 0) {
            throw new RuntimeException("Insufficient stock or product not found: " + productId);
        }
        // Evict from cache so the next read fetches the fresh, decremented state
        evictProduct(productId);
    }

    @CacheEvict(value = "products", key = "#id")
    public void evictProduct(Long id) {
        log.info("Evicting product {} from cache", id);
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product {} and evicting from cache", id);
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }
}