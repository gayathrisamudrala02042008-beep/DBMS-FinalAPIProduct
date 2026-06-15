package com.klu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klu.entity.Pricing;
import com.klu.service.PricingService;

@RestController

@RequestMapping("/pricing")

@CrossOrigin("*")

public class PricingController {

    @Autowired

    PricingService service;

    @GetMapping

    public List<Pricing>
    getPricing(){

        return service
        .getPricing();

    }

    @PostMapping

    public Pricing save(

    @RequestBody
    Pricing pricing){

        return service
        .savePricing(
        pricing);

    }

}