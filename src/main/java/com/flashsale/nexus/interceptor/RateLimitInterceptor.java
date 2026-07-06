package com.flashsale.nexus.interceptor;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.HandlerInterceptor;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1. Always allow CORS pre-flight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // 2. If no token, allow to proceed
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            return true;
        }

        // 3. Rate limiting logic
        Bucket bucket = cache.computeIfAbsent(token, k -> createNewBucket());
        if (bucket.tryConsume(1)) {
            return true;
        } else {
            log.warn("Rate limit exceeded for token: {}", token);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too Many Requests: Please slow down.");
            return false;
        }

        // ADDED: This ensures the method always returns a boolean
        // return true; // (Optional: you can also place return true here if the logic flows through)
    }
}