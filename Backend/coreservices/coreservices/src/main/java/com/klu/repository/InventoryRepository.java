package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Inventory;

public interface
InventoryRepository

extends JpaRepository
<Inventory,Long>{

}