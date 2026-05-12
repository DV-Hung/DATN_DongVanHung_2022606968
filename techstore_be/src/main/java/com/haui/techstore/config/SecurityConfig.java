package com.haui.techstore.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                        JwtAccessDeniedHandler jwtAccessDeniedHandler,
                        CorsConfigurationSource corsConfigurationSource) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                                .accessDeniedHandler(jwtAccessDeniedHandler))
                                .authorizeHttpRequests(authz -> authz
                                                // PUBLIC ENDPOINTS - Không cần đăng nhập
                                                // User registration & login
                                                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()

                                                // Browse products, brands, categories - Public (GET only)
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/brands/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/product-variants/**").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/suppliers/**").permitAll()

                                                // Đặt hàng - Public (không cần đăng nhập)
                                                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/orders/{id}").permitAll()

                                                // Cart items - Public
                                                .requestMatchers(HttpMethod.GET, "/api/cart-items/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/cart-items").permitAll()
                                                .requestMatchers(HttpMethod.PUT, "/api/cart-items/**").permitAll()
                                                .requestMatchers(HttpMethod.DELETE, "/api/cart-items/**").permitAll()

                                                // Swagger/OpenAPI
                                                .requestMatchers("/v3/api-docs/**").permitAll()
                                                .requestMatchers("/swagger-ui/**").permitAll()
                                                .requestMatchers("/swagger-ui.html").permitAll()

                                                // AUTHENTICATED USER ENDPOINTS
                                                // Users can update only their own profile
                                                .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()

                                                // Get personal orders
                                                .requestMatchers(HttpMethod.GET, "/api/orders/user/**").authenticated()

                                                // ADMIN ENDPOINTS - Require ADMIN role
                                                // Dashboard statistics - ADMIN only
                                                .requestMatchers(HttpMethod.GET, "/api/dashboard/**").hasRole("ADMIN")

                                                // User management - ADMIN only
                                                .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.GET, "/api/users/all").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")

                                                // Product management - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/products").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                                                // Brand management - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/brands").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/brands/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/brands/**").hasRole("ADMIN")

                                                // Category management - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/categories").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/categories/**")
                                                .hasRole("ADMIN")

                                                // Product variant management - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/product-variants")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/product-variants/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/product-variants/**")
                                                .hasRole("ADMIN")

                                                // Supplier management - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/suppliers").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/suppliers/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/suppliers/**")
                                                .hasRole("ADMIN")

                                                // Import orders - ADMIN only
                                                .requestMatchers("/api/import-orders/**").hasRole("ADMIN")

                                                // File upload - ADMIN only
                                                .requestMatchers(HttpMethod.POST, "/api/files/upload/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/files/**").hasRole("ADMIN")

                                                // Order management (advanced) - ADMIN only
                                                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")

                                                // System logs - ADMIN only
                                                .requestMatchers(HttpMethod.GET, "/api/system-logs/**").hasRole("ADMIN")

                                                // Any other request requires authentication
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
