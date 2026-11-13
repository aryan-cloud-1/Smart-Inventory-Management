package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.JwtAuthResponse;
import com.smartinventory.dto.LoginRequest;
import com.smartinventory.dto.RegisterRequest;
import com.smartinventory.dto.UserDTO;
import com.smartinventory.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login, registration, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticate credentials and obtain JWT Bearer token")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse tokenResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", tokenResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Register User", description = "Register a new user account with specific roles")
    public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        ApiResponse<UserDTO> response = authService.registerUser(registerRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Current User Profile", description = "Retrieve profile details of the authenticated user")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        UserDTO profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}
