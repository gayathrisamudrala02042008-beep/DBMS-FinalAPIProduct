package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Category;

public interface
CategoryRepository

extends JpaRepository
<Category,Long>{

}