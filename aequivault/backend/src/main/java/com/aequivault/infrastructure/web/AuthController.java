package com.aequivault.infrastructure.web;

import com.aequivault.infrastructure.persistence.entity.UserEntity;
import com.aequivault.infrastructure.persistence.entity.RoleEntity;
import com.aequivault.infrastructure.persistence.repository.UserRepository;
import com.aequivault.infrastructure.security.JwtService;
import com.aequivault.infrastructure.web.dto.LoginRequest;
import com.aequivault.infrastructure.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales inválidas o cuenta inactiva."));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalArgumentException("La cuenta de usuario no está activa.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales inválidas o cuenta inactiva.");
        }

        Set<String> roles = user.getRoles().stream().map(RoleEntity::getName).collect(Collectors.toSet());
        String token = jwtService.generateToken(user.getEmail(), user.getTenantId(), roles);

        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getTenantId()));
    }
}
