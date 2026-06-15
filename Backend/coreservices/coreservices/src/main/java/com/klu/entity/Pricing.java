package com.klu.entity;

import jakarta.persistence.*;

@Entity
@Table(name="pricing")

public class Pricing {

    @Id

    @GeneratedValue(
    strategy=
    GenerationType.IDENTITY)

    private Long id;

    private Double price;

    public Pricing(){}

    public Long getId(){
        return id;
    }

    public void setId(
    Long id){

        this.id=id;

    }

    public Double getPrice(){
        return price;
    }

    public void setPrice(
    Double price){

        this.price=price;

    }

}