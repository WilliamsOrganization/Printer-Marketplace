package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.Users;
import com.ecommerce.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * DataInitializer
 */
@Configuration
public class DataInitializer {

	@Value("${app.admin.password}")
	private String password;
	@Value("${app.admin.email}")
	private String email;
	@Value("${app.admin.phone}")
	private String phone;

	@Bean
	ApplicationRunner createDefaultAdmin(UserRepository userRepository) {
		return args -> {
			if (userRepository.findByEmail(email).isEmpty()) {
				Users admin = new Users();
				admin.setEmail(email);
				// TODO: use proper password encoding
				admin.setPassword(password);
				admin.setPhoneNumber(phone);
				admin.setIsAdmin(true);
				admin.setUserRole(Users.Role.ADMIN);
				userRepository.save(admin);
			}
		};
	}
}
