package com.foodorder.service;

import com.foodorder.dto.AuthDto;
import com.foodorder.entity.User;
import com.foodorder.repository.UserRepository;
import com.foodorder.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user registration and login logic.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    /**
     * Register a new user with USER role.
     * Throws exception if email is already in use.
     */
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        // Build and save the new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    /**
     * Authenticate user and return JWT token.
     * Throws exception if credentials are invalid.
     */
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        try {
            // Authenticate credentials via Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(), request.getPassword()));
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }
}
