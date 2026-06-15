package com.klu.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.Product;
import com.klu.repository.ProductRepository;

@Service

public class ProductService {

    @Autowired

    ProductRepository repo;

    public List<Product>
    getAllProducts(){

        return repo.findAll();

    }

    public Product
    getProductById(
    String id){

        return repo.findById(id)
        .orElse(null);

    }

    public Product
    addProduct(
    Product product){

        return repo.save(
        product);

    }

    public Product
    updateProduct(
    String id,
    Product product){

        Product existing=
        repo.findById(id)
        .orElse(null);

        if(existing!=null){

            existing.setName(
            product.getName());

            existing.setBrand(
            product.getBrand());

            existing.setDescription(
            product.getDescription());

            return repo.save(
            existing);

        }

        return null;

    }

    public void
    deleteProduct(
    String id){

        repo.deleteById(id);

    }

}