package com.example.demo.dto;

import com.example.demo.model.User;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    
    public UserResponse() {}
    
    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.bio = user.getBio();
    }
    
    public UserResponse(Long id, String name, String email, String bio) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.bio = bio;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
}