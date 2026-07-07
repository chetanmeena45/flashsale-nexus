package com.flashsale.nexus.config;

import com.flashsale.nexus.interceptor.RateLimitInterceptor;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
// @EnableWebMvc  // usually not needed with Spring Boot
public class WebConfig implements WebMvcConfigurer {

    private final ProxyManager<String> proxyManager;

    // Constructor injection of ProxyManager bean
    public WebConfig(ProxyManager<String> proxyManager) {
        this.proxyManager = proxyManager;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register RateLimitInterceptor with ProxyManager
        registry.addInterceptor(new RateLimitInterceptor(proxyManager))
                .addPathPatterns("/api/order/**");   // updated path for rate limiting
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Include BOTH variations to be safe
                .allowedHeaders("Authorization", "Content-Type", "Correlation-Id", "X-Correlation-ID")
                // Expose BOTH so the browser lets JavaScript see them
                .exposedHeaders("Correlation-Id", "X-Correlation-ID")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
