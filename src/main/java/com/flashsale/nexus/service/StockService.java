package com.flashsale.nexus.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Slf4j
@Service
public class StockService {

    // Switched to StringRedisTemplate for better performance with connection pooling
    private final StringRedisTemplate redisTemplate;

    public StockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static final String LUA_SCRIPT =
            "if (tonumber(redis.call('get', KEYS[1]) or 0) >= tonumber(ARGV[1])) then " +
                    "   return redis.call('decrby', KEYS[1], ARGV[1]) " +
                    "else " +
                    "   return -1 " +
                    "end";

    public boolean decrementStock(String productId, int quantity) {
        String key = "stock:" + productId;
        // Updated script to handle Long results correctly with StringRedisTemplate
        DefaultRedisScript<Long> script = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);

        Long result = redisTemplate.execute(script, Collections.singletonList(key), String.valueOf(quantity));

        if (result != null && result >= 0) {
            log.info("Stock deducted successfully for product: {}. Remaining: {}", productId, result);
            return true;
        }
        log.warn("Stock decrement failed for product: {}. Insufficient stock.", productId);
        return false;
    }
}