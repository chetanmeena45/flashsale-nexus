package com.flashsale.nexus.repository;

import com.flashsale.nexus.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // JpaRepository provides save(), findById(), findAll(), delete(), etc.
}