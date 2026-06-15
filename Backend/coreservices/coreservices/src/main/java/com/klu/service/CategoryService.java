package com.klu.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.Category;
import com.klu.repository.CategoryRepository;

@Service

public class CategoryService {

    @Autowired

    CategoryRepository repo;

    public List<Category>
    getAllCategories(){

        return repo.findAll();

    }

    public Category
    addCategory(
    Category category){

        return repo.save(
        category);

    }

}