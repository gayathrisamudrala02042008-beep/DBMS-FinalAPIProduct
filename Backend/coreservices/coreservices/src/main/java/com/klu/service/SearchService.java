package com.klu.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.Product;
import com.klu.repository.ProductRepository;

@Service

public class SearchService {

    @Autowired

    ProductRepository repo;

    public List<Product>
    searchProducts(
    String query){

        String[] words=
        query.split(" ");

        List<Product> result=
        new ArrayList<>();

        for(String word:words){

            result=
            repo
            .findByNameContainingIgnoreCase(
            word);

            if(!result.isEmpty()){

                return result;

            }

        }

        return result;

    }

}