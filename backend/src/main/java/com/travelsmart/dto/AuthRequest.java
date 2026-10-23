package com.travelsmart.dto;

public class AuthRequest {
    private String username;
    private String email;
    private String password;

    public AuthRequest() {}
    public AuthRequest(String username, String password) {
        this.username = username;
        this.email = username;
        this.password = password;
    }

    public String getUsername() { return username != null ? username : email; }
    public void setUsername(String username) { this.username = username; if (this.email == null) this.email = username; }

    public String getEmail() { return email != null ? email : username; }
    public void setEmail(String email) { this.email = email; if (this.username == null) this.username = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
