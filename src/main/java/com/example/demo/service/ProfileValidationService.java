package com.example.demo.service;

import com.example.demo.dto.ProfileValidationRequest;
import com.example.demo.dto.ProfileValidationResponse;
import com.example.demo.exception.ProfileValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class ProfileValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ProfileValidationService.class);
    
    private final WebClient webClient;
    private final String profileValidationUrl;
    
    public ProfileValidationService(
            WebClient.Builder webClientBuilder,
            @Value("${app.profile-validation.base-url:http://localhost:8081}") String baseUrl,
            @Value("${app.profile-validation.timeout:5}") int timeoutSeconds) {
        this.profileValidationUrl = baseUrl + "/api/profile/validate";
        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .build();
        logger.info("ProfileValidationService initialized with URL: {} and timeout: {}s", 
                    baseUrl, timeoutSeconds);
    }
    
    public ProfileValidationResponse validateProfile(ProfileValidationRequest request) {
        try {
            logger.debug("Validating profile for user: {} with email: {}", 
                        request.getName(), request.getEmail());
            
            ProfileValidationResponse response = webClient
                    .post()
                    .uri("/api/profile/validate")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ProfileValidationResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(WebClientResponseException.class, this::handleWebClientError)
                    .onErrorResume(Exception.class, this::handleGenericError)
                    .block();
            
            logger.debug("Profile validation result for {}: valid={}, message={}", 
                        request.getEmail(), response.isValid(), response.getMessage());
            
            return response;
            
        } catch (Exception e) {
            logger.error("Unexpected error during profile validation for {}: {}", 
                        request.getEmail(), e.getMessage(), e);
            throw new ProfileValidationException("Profile validation failed: " + e.getMessage(), e);
        }
    }
    
    private Mono<ProfileValidationResponse> handleWebClientError(WebClientResponseException ex) {
        logger.warn("Profile validation service returned error: {} - {}", 
                   ex.getStatusCode(), ex.getResponseBodyAsString());
        
        if (ex.getStatusCode().is4xxClientError()) {
            return Mono.just(new ProfileValidationResponse(false, 
                    "Profile validation rejected: " + ex.getResponseBodyAsString(), "HIGH"));
        } else {
            return Mono.error(new ProfileValidationException(
                    "Profile validation service error: " + ex.getStatusCode()));
        }
    }
    
    private Mono<ProfileValidationResponse> handleGenericError(Exception ex) {
        logger.error("Profile validation service unavailable: {}", ex.getMessage());
        return Mono.error(new ProfileValidationException(
                "Profile validation service temporarily unavailable", ex));
    }
}