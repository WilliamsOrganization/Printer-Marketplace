package com.ecommerce.backend.seeding;

import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DataInitializer
 */
@Slf4j
@Configuration
public class UserDataInitializer {
    private static final Logger logger =
        LoggerFactory.getLogger(UserDataInitializer.class);

    @Value("${app.admin.password}") private String password;
    @Value("${app.admin.email}") private String email;
    @Value("${app.admin.phone}") private String phone;

    @Bean
    ApplicationRunner createDefaultAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail(email).isEmpty()) {
                logger.info("[INIT]: No default admin detected "
                                + "populating seed data for email: {}",
                            email);
                Users admin = Users.builder()
                                  .password(password)
                                  .email(email)
                                  .phoneNumber(phone)
                                  .isAdmin(true)
                                  .userRole(Users.Role.ADMIN)
                                  .build();
                // TODO: use proper password encoding
                userRepository.save(admin);
            }
        };
    }
}
