package com.aequivault.infrastructure.demo;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
@ConditionalOnProperty(name = "demo.ephemeral.enabled", havingValue = "true")
public class DemoController {

    private final DemoTenantService demoTenantService;

    public DemoController(DemoTenantService demoTenantService) {
        this.demoTenantService = demoTenantService;
    }

    @PostMapping("/start")
    public ResponseEntity<DemoStartResponse> startDemo() {
        return ResponseEntity.ok(demoTenantService.startDemo());
    }
}
