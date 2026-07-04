package com.flashsale.nexus.config;

import com.flashsale.nexus.interceptor.AuthInterceptor;
import com.flashsale.nexus.interceptor.RateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register AuthInterceptor
        registry.addInterceptor(new AuthInterceptor())
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/**");

        // Register RateLimitInterceptor specifically for purchase endpoints
        registry.addInterceptor(new RateLimitInterceptor())
                .addPathPatterns("/api/order/purchase/**");
    }
}