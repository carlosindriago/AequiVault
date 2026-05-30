package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.service.RbacService;
import com.aequivault.infrastructure.web.dto.RbacDtos.UserCreateRequest;
import com.aequivault.infrastructure.web.dto.RbacDtos.UserResponse;
import com.aequivault.infrastructure.web.dto.RbacDtos.UserStatusChangeRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final RbacService rbacService;

    public UserController(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(rbacService.getUsers());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rbacService.createUser(request));
    }
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable("id") UUID id, @Valid @RequestBody UserStatusChangeRequest request) {
        String adminEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        rbacService.deactivateUser(id, request, adminEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivateUser(@PathVariable("id") UUID id, @Valid @RequestBody UserStatusChangeRequest request) {
        String adminEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        rbacService.reactivateUser(id, request, adminEmail);
        return ResponseEntity.noContent().build();
    }
}
