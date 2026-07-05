package com.flashsale.nexus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisHealthCheck implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RedisHealthCheck.class);
    private final RedisConnectionFactory connectionFactory;

    public RedisHealthCheck(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Verify connection by sending a PING
            connectionFactory.getConnection().ping();
            log.info("Redis connection verified successfully at startup.");
        } catch (Exception e) {
            log.error("CRITICAL: Unable to connect to Redis during startup: {}", e.getMessage());
            // Fail fast: If Redis is required for core functionality, we stop the app
            throw new RuntimeException("Redis connection failed on startup", e);
        }
    }
}