package com.klu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Product;

public interface ProductRepository
extends JpaRepository
<Product,String>{

List<Product>
findByNameContainingIgnoreCase(
String keyword);

}