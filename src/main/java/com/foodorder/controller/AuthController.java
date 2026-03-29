package com.foodorder.controller;

import com.foodorder.dto.AuthDto;
import com.foodorder.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Public access — no JWT required.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /** POST /api/auth/register — register a new user */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        try {
            AuthDto.AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** POST /api/auth/login — login for both USER and ADMIN */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
