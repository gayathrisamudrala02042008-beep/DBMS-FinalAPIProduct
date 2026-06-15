package com.klu.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.klu.entity.Inventory;
import com.klu.service.InventoryService;

@RestController

@RequestMapping("/inventory")

@CrossOrigin("*")

public class InventoryController {

    @Autowired

    InventoryService service;

    @GetMapping

    public List<Inventory>
    getInventory(){

        return service
        .getInventory();

    }

    @PostMapping

    public Inventory save(

    @RequestBody
    Inventory inventory){

        return service
        .saveInventory(
        inventory);

    }

}