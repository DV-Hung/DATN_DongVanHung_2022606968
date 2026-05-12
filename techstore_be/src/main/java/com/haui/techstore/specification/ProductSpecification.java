package com.haui.techstore.specification;

import com.haui.techstore.entity.Product;
import com.haui.techstore.entity.ProductVariant;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterByCategory(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category").get("id"), categoryId);
        };
    }

    public static Specification<Product> filterByPriceRange(Double minPrice, Double maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.conjunction();
            }

            // Join with variants to check prices
            Subquery<Double> minPriceSubquery = query.subquery(Double.class);
            Root<ProductVariant> variantRoot = minPriceSubquery.from(ProductVariant.class);
            minPriceSubquery.select(criteriaBuilder.min(variantRoot.get("price")))
                    .where(criteriaBuilder.equal(variantRoot.get("product").get("id"), root.get("id")));

            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(minPriceSubquery, minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(minPriceSubquery, maxPrice));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterByBrandNames(List<String> brandNames) {
        return (root, query, criteriaBuilder) -> {
            if (brandNames == null || brandNames.isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            // Convert to lowercase for case-insensitive comparison
            List<Predicate> predicates = new ArrayList<>();
            for (String brandName : brandNames) {
                predicates.add(
                        criteriaBuilder.equal(
                                criteriaBuilder.lower(root.get("brand").get("name")),
                                brandName.toLowerCase()));
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterByBrandId(Long brandId) {
        return (root, query, criteriaBuilder) -> {
            if (brandId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("brand").get("id"), brandId);
        };
    }

    public static Specification<Product> searchByName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Product> combineFilters(
            Long categoryId,
            Double minPrice,
            Double maxPrice,
            List<String> brandNames,
            String name,
            String sortBy) {
        return Specification
                .where(filterByCategory(categoryId))
                .and(filterByPriceRange(minPrice, maxPrice))
                .and(filterByBrandNames(brandNames))
                .and(searchByName(name));
    }
}
