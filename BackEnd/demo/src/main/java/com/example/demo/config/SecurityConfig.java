package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.service.CustomUserDetailsService;
import org.springframework.security.config.annotation.web.configurers.LogoutConfigurer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.http.HttpMethod;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private CustomTokenAuthenticationFilter customTokenAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println("===> SecurityFilterChain is being configured!");
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable()).authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Cho phép tất cả OPTIONS để fix
                                                                                // preflight CORS
                        .requestMatchers("/", "/login").permitAll() // Allow access to root and login page
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/cartoons/vip-content").hasAnyRole("VIP", "ADMIN")
                        .requestMatchers("/api/vip/**").hasAnyRole("VIP", "ADMIN")                        .requestMatchers("/css/**", "/js/**", "/images/**", "/favicon.ico").permitAll() // Allow static
                                                                                                        // resources
                        .requestMatchers("/api/cartoons/**").permitAll() // PUBLIC cartoon API
                        .requestMatchers("/api/auth/**").permitAll() // PUBLIC auth API
                        .requestMatchers(HttpMethod.GET, "/api/comments/cartoon/**").permitAll() // Allow reading comments without auth
                        .requestMatchers("/api/user-achievements/username/**").hasAnyRole("USER", "VIP", "ADMIN")
                        // Nếu có các API khác cần xác thực, thêm ở đây
                        .requestMatchers("/api/**").authenticated() // lock API access to authenticated users
                        .anyRequest().authenticated() // Ensure all other requests are authenticated
                ).formLogin(form -> form
                        .loginPage("/login")
                        .loginProcessingUrl("/login")
                        .defaultSuccessUrl("/admin", true) // Luôn redirect về /admin sau khi login thành công
                        .permitAll())
                .logout(LogoutConfigurer::permitAll)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\": \"Unauthorized\"}"); // Correct way to escape
                                                                                             // quotes in Java String
                            } else {
                                response.sendRedirect(request.getContextPath() + "/login");
                            }
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\": \"Forbidden\"}"); // Correct way to escape
                                                                                          // quotes in Java String
                            } else {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType("text/html");
                                response.getWriter().write(
                                        "<html><body><h1>Access Denied</h1><p>You do not have permission to view this page.</p></body></html>");
                            }
                        }));
        // Thêm filter xác thực token vào filter chain
        http.addFilterBefore(customTokenAuthenticationFilter,
                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // return NoOpPasswordEncoder.getInstance(); // Deprecated
        return PasswordEncoderFactories.createDelegatingPasswordEncoder(); // Use a more secure default
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of(
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:5501",
                "http://127.0.0.1:5501",
                "http://localhost:5502",
                "http://127.0.0.1:5502",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        // Thêm domain FE thực tế nếu deploy
        )); // Chỉ cho phép origin cụ thể khi allowCredentials=true
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho mọi endpoint
        return source;
    }
}
