package com.klu.entity;

import jakarta.persistence.*;

@Entity

@Table(name="inventory")

public class Inventory {

    @Id

    @GeneratedValue(
    strategy=
    GenerationType.IDENTITY)

    private Long id;

    private Integer stock;

    public Inventory(){}

    public Long getId(){
        return id;
    }

    public void setId(
    Long id){

        this.id=id;

    }

    public Integer getStock(){
        return stock;
    }

    public void setStock(
    Integer stock){

        this.stock=stock;

    }

}