package com.example.demo.service;

import com.example.demo.dto.UserCreateRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.ProfileValidationRequest;
import com.example.demo.dto.ProfileValidationResponse;
import com.example.demo.exception.UserNotFoundException;
import com.example.demo.exception.EmailAlreadyExistsException;
import com.example.demo.exception.ProfileValidationException;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final ProfileValidationService profileValidationService;
    
    @Autowired
    public UserService(UserRepository userRepository, ProfileValidationService profileValidationService) {
        this.userRepository = userRepository;
        this.profileValidationService = profileValidationService;
    }
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
        return new UserResponse(user);
    }
    
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email " + request.getEmail() + " already exists");
        }
        
        // Validate profile with external service
        ProfileValidationRequest validationRequest = new ProfileValidationRequest(
            request.getName(), request.getEmail(), request.getBio());
        ProfileValidationResponse validationResponse = profileValidationService.validateProfile(validationRequest);
        
        if (!validationResponse.isValid()) {
            throw new ProfileValidationException("Profile validation failed: " + validationResponse.getMessage());
        }
        
        User user = new User(request.getName(), request.getEmail(), request.getBio());
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser);
    }
    
    public UserResponse updateUser(Long id, UserCreateRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
        
        if (!existingUser.getEmail().equals(request.getEmail()) && 
            userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email " + request.getEmail() + " already exists");
        }
        
        // Validate updated profile with external service
        ProfileValidationRequest validationRequest = new ProfileValidationRequest(
            request.getName(), request.getEmail(), request.getBio());
        ProfileValidationResponse validationResponse = profileValidationService.validateProfile(validationRequest);
        
        if (!validationResponse.isValid()) {
            throw new ProfileValidationException("Profile validation failed: " + validationResponse.getMessage());
        }
        
        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());
        existingUser.setBio(request.getBio());
        
        User updatedUser = userRepository.save(existingUser);
        return new UserResponse(updatedUser);
    }
    
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }
}