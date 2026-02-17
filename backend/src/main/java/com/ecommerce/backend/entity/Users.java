package com.ecommerce.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Users
 */
@Data
@Entity
@Table(name = "users")
public class Users {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String email;
	private String phoneNumber; // completes to phone_number in the table
	private String password;

	public Long getId() { return id;}
	public void setId(Long id) { this.id=id; }

	public String getEmail() { return email;}
	public void setEmail(String Email) { this.email=Email; }

	public String getPhoneNumber() { return phoneNumber;}
	public void setPhoneNumber(String PhoneNumber) { this.phoneNumber=PhoneNumber; }

	public String getPassword() { return password;}
	public void setPassword(String Password) { this.password=Password; }

}
