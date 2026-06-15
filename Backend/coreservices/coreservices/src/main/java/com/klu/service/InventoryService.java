package com.klu.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.Inventory;
import com.klu.repository.InventoryRepository;

@Service

public class InventoryService {

    @Autowired

    InventoryRepository repo;

    public List<Inventory>
    getInventory(){

        return repo.findAll();

    }

    public Inventory
    saveInventory(
    Inventory inventory){

        return repo.save(
        inventory);

    }

}