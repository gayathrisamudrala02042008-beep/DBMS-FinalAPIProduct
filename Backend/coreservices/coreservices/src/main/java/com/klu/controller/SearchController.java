package com.klu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klu.dto.SearchRequestDTO;
import com.klu.entity.Product;
import com.klu.service.SearchService;

@RestController

@RequestMapping("/search")

@CrossOrigin("*")

public class SearchController {

    @Autowired

    SearchService service;

    @PostMapping

    public List<Product>
    search(

    @RequestBody
    SearchRequestDTO dto){

        return service
        .searchProducts(
        dto.getQuery());

    }

}