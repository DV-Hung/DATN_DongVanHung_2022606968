package com.haui.techstore;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TechstoreApplication {

	public static void main(String[] args) {
		// Load .env.local file before Spring Boot starts
		Dotenv dotenv = Dotenv.configure()
				.directory(".")
				.filename(".env.local")
				.ignoreIfMissing()
				.load();

		// Set all environment variables from .env.local to System properties
		// so Spring Boot can use them
		dotenv.entries().forEach(entry -> {
			System.setProperty(entry.getKey(), entry.getValue());
		});

		SpringApplication.run(TechstoreApplication.class, args);
	}

}
