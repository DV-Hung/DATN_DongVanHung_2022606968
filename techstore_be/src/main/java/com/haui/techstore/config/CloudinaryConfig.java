package com.haui.techstore.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary Configuration
 * Initializes Cloudinary SDK with API credentials from properties
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Initialize Cloudinary bean with credentials
     */
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(String.format(
                "cloudinary://%s:%s@%s",
                apiKey,
                apiSecret,
                cloudName));
    }
}
