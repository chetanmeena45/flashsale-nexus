package com.flashsale.nexus.controller;

import com.flashsale.nexus.service.StockService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    private final StockService stockService;

    public OrderController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/purchase/{productId}")
    public String purchase(@PathVariable String productId) {
        boolean success = stockService.decrementStock(productId, 1);
        return success ? "Order placed successfully!" : "Out of stock!";
    }
}