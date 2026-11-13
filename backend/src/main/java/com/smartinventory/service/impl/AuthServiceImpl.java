package com.smartinventory.service.impl;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.JwtAuthResponse;
import com.smartinventory.dto.LoginRequest;
import com.smartinventory.dto.RegisterRequest;
import com.smartinventory.dto.UserDTO;
import com.smartinventory.entity.Role;
import com.smartinventory.entity.RoleType;
import com.smartinventory.entity.User;
import com.smartinventory.exception.BadRequestException;
import com.smartinventory.exception.ResourceNotFoundException;
import com.smartinventory.repository.RoleRepository;
import com.smartinventory.repository.UserRepository;
import com.smartinventory.security.JwtTokenProvider;
import com.smartinventory.security.UserPrincipal;
import com.smartinventory.service.AuditLogService;
import com.smartinventory.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    @Override
    public JwtAuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        auditLogService.recordAction("USER", userPrincipal.getId(), "LOGIN_SUCCESS", userPrincipal.getUsername(), null, "User successfully authenticated");

        return JwtAuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .userId(userPrincipal.getId())
                .username(userPrincipal.getUsername())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .roles(roles)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<UserDTO> registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        Set<Role> roles = new HashSet<>();
        if (registerRequest.getRoles() == null || registerRequest.getRoles().isEmpty()) {
            Role defaultRole = roleRepository.findByName(RoleType.ROLE_STAFF)
                    .orElseThrow(() -> new ResourceNotFoundException("Default Role not found"));
            roles.add(defaultRole);
        } else {
            for (String roleName : registerRequest.getRoles()) {
                RoleType type;
                try {
                    type = RoleType.valueOf(roleName.toUpperCase());
                } catch (IllegalArgumentException e) {
                    type = RoleType.ROLE_STAFF;
                }
                Role role = roleRepository.findByName(type)
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                roles.add(role);
            }
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phone(registerRequest.getPhone())
                .isActive(true)
                .roles(roles)
                .build();

        User savedUser = userRepository.save(user);

        auditLogService.recordAction("USER", savedUser.getId(), "USER_REGISTERED", savedUser.getUsername(), null, "New user registered with roles: " + roles);

        return ApiResponse.ok("User registered successfully", mapToUserDTO(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("No authenticated user session");
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        return mapToUserDTO(user);
    }

    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .isActive(user.getIsActive())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()))
                .build();
    }
}
