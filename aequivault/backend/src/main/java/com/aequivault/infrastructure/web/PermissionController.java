package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.service.RbacService;
import com.aequivault.infrastructure.web.dto.RbacDtos.PermissionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {

    private final RbacService rbacService;

    public PermissionController(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getPermissions() {
        return ResponseEntity.ok(rbacService.getPermissions());
    }
}
