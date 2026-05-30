package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.service.RbacService;
import com.aequivault.infrastructure.web.dto.RbacDtos.RoleRequest;
import com.aequivault.infrastructure.web.dto.RbacDtos.RoleResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RbacService rbacService;

    public RoleController(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    @GetMapping
    public ResponseEntity<List<RoleResponse>> getRoles() {
        return ResponseEntity.ok(rbacService.getRoles());
    }

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rbacService.createRole(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> updateRole(@PathVariable("id") UUID id, @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(rbacService.updateRole(id, request));
    }
}
