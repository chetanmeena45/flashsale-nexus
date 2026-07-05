package com.flashsale.nexus.repository;

import com.flashsale.nexus.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Product p SET p.stock = p.stock - :quantity WHERE p.id = :productId AND p.stock >= :quantity")
    int decrementStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}