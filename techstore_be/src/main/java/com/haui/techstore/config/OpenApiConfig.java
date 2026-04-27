package com.haui.techstore.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger Configuration
 * Cấu hình Swagger UI hỗ trợ JWT Token Authentication
 */
@Configuration
@OpenAPIDefinition(info = @Info(title = "Techstore API", version = "1.0", description = "API Documentation cho Techstore - Cửa hàng bán lẻ công nghệ", contact = @Contact(name = "Support", email = "support@techstore.com")), security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, scheme = "bearer", bearerFormat = "JWT", description = "Nhập JWT Token để xác thực. Bỏ qua phần 'Bearer ' và chỉ dán token.")
public class OpenApiConfig {

    /**
     * Cấu hình OpenAPI Bean để tích hợp JWT Bearer Token
     * Cho phép người dùng nhập token trong Swagger UI
     */
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new io.swagger.v3.oas.models.info.Info()
                        .title("Techstore API")
                        .version("1.0")
                        .description("API cho hệ thống quản lý bán hàng công nghệ")
                        .contact(new io.swagger.v3.oas.models.info.Contact()
                                .name("Support Team")
                                .email("support@techstore.com")));
    }
}
