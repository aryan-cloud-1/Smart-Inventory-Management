package com.smartinventory.service;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.JwtAuthResponse;
import com.smartinventory.dto.LoginRequest;
import com.smartinventory.dto.RegisterRequest;
import com.smartinventory.dto.UserDTO;

public interface AuthService {
    JwtAuthResponse authenticateUser(LoginRequest loginRequest);
    ApiResponse<UserDTO> registerUser(RegisterRequest registerRequest);
    UserDTO getCurrentUserProfile();
}
