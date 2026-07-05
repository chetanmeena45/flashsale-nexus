package com.flashsale.nexus.service;

import com.flashsale.nexus.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderPersistenceService {

    private final ProductRepository productRepository;

    @Async("taskExecutor")
    @Retryable(
            retryFor = { Exception.class },
            maxAttempts = 3,
            backoff = @Backoff(delay = 2000, multiplier = 2)
    )
    @Transactional
    public void persistOrder(Long productId, Integer quantity) {
        log.info("Persisting order to DB for product: {} with quantity: {}", productId, quantity);

        // Assuming logic to decrement stock in DB
        productRepository.decrementStock(productId, quantity);

        log.info("Successfully persisted order for product: {}", productId);
    }

    // Logic to handle exhausted retries (Dead Letter Concept)
    public void handlePersistenceFailure(Long productId, Exception e) {
        log.error("CRITICAL: Failed to persist order for product {} after retries. Moving to error log/DLQ. Error: {}", productId, e.getMessage());
        // In a production scenario, you would push this record to a RabbitMQ/Kafka DLQ or a 'failed_orders' table
    }
}