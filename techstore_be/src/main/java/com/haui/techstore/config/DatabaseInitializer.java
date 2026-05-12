package com.haui.techstore.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.haui.techstore.entity.Category;
import com.haui.techstore.entity.User;
import com.haui.techstore.repository.CategoryRepository;
import com.haui.techstore.repository.UserRepository;

@Service
@Profile("!test")
public class DatabaseInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> START INIT DATABASE");

        // Initialize categories
        initializeCategories();

        // Initialize admin user
        if (this.userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User user = new User();
            user.setEmail("admin@gmail.com");
            user.setPassword(this.passwordEncoder.encode("123456"));
            user.setFullName("Admin");
            user.setRole("ADMIN");
            this.userRepository.save(user);
        } else {
            System.out.println(">>> SKIP INIT DATABASE ~ ALREADY HAVE DATA....");
        }
        System.out.println(">>> END INIT DATABASE");
    }

    private void initializeCategories() {
        String[] categoryNames = { "Laptop", "Điện thoại", "Phụ kiện" };
        String[] categoryDescriptions = {
                "Các sản phẩm laptop và máy tính xách tay",
                "Các sản phẩm điện thoại di động",
                "Các sản phẩm phụ kiện công nghệ"
        };
        String[] categorySlugs = { "laptop", "dien-thoai", "phu-kien" };

        for (int i = 0; i < categoryNames.length; i++) {
            if (this.categoryRepository.findByName(categoryNames[i]).isEmpty()) {
                Category category = new Category();
                category.setName(categoryNames[i]);
                category.setDescription(categoryDescriptions[i]);
                category.setSlug(categorySlugs[i]);
                category.setIsActive(true);
                this.categoryRepository.save(category);
                System.out.println(">>> Created category: " + categoryNames[i]);
            } else {
                System.out.println(">>> Category already exists: " + categoryNames[i]);
            }
        }
    }
}
