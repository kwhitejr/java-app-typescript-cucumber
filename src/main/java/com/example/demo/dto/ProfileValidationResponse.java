package com.example.demo.dto;

public class ProfileValidationResponse {
    
    private boolean valid;
    private String message;
    private String riskScore;
    
    public ProfileValidationResponse() {}
    
    public ProfileValidationResponse(boolean valid, String message, String riskScore) {
        this.valid = valid;
        this.message = message;
        this.riskScore = riskScore;
    }
    
    public boolean isValid() {
        return valid;
    }
    
    public void setValid(boolean valid) {
        this.valid = valid;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getRiskScore() {
        return riskScore;
    }
    
    public void setRiskScore(String riskScore) {
        this.riskScore = riskScore;
    }
}