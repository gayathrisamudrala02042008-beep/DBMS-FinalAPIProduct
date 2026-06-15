package com.klu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klu.entity.Category;
import com.klu.service.CategoryService;

@RestController

@RequestMapping("/categories")

@CrossOrigin("*")

public class CategoryController {

    @Autowired

    CategoryService service;

    @GetMapping

    public List<Category>
    getAll(){

        return service
        .getAllCategories();

    }

    @PostMapping

    public Category add(

    @RequestBody
    Category category){

        return service
        .addCategory(category);

    }

}