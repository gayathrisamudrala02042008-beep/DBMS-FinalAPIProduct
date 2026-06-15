package com.klu.entity;

import jakarta.persistence.*;

@Entity
@Table(name="products")

public class Product {

    @Id
    @Column(name="id")
    private String id;

    private String name;

    private String brand;

    private Long description;

    public Product(){}

    public String getId() {
        return id;
    }

    public void setId(String id){
        this.id=id;
    }

    public String getName(){
        return name;
    }

    public void setName(
    String name){

        this.name=name;

    }

    public String getBrand(){
        return brand;
    }

    public void setBrand(
    String brand){

        this.brand=brand;

    }

    public Long getDescription(){
        return description;
    }

    public void setDescription(
    Long description){

        this.description=
        description;

    }

}