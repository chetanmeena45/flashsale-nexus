package com.flashsale.nexus.config;

import com.flashsale.nexus.interceptor.RateLimitInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
//@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public RateLimitInterceptor rateLimitInterceptor() {
        return new RateLimitInterceptor();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor())
                .addPathPatterns("/products/**");
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