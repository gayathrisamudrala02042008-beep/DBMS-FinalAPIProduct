package com.klu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klu.entity.Product;
import com.klu.service.ProductService;

@RestController

@RequestMapping("/products")

@CrossOrigin("*")

public class ProductController {

    @Autowired

    ProductService service;

    @GetMapping

    public List<Product>
    getAll(){

        return service
        .getAllProducts();

    }

    @GetMapping("/{id}")

    public Product getById(
    @PathVariable String id){

        return service
        .getProductById(id);

    }

    @PostMapping

    public Product addProduct(
    @RequestBody Product product){

        return service
        .addProduct(product);

    }

    @PutMapping("/{id}")

    public Product updateProduct(

    @PathVariable String id,

    @RequestBody Product product){

        return service
        .updateProduct(
        id,
        product);

    }

    @DeleteMapping("/{id}")

    public void delete(

    @PathVariable String id){

        service
        .deleteProduct(id);

    }

}