package com.klu.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.Pricing;
import com.klu.repository.PricingRepository;

@Service

public class PricingService {

    @Autowired

    PricingRepository repo;

    public List<Pricing>
    getPricing(){

        return repo.findAll();

    }

    public Pricing
    savePricing(
    Pricing pricing){

        return repo.save(
        pricing);

    }

}