import mongoose from "mongoose";
import Product from "../models/Product.js";

// Create Product
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Product By ID (by _id or postgresId)
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findOne({ $or: [{ _id: id }, { postgresId: id }] });
        } else {
            product = await Product.findOne({ postgresId: id });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Product (by _id or postgresId)
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findOneAndUpdate(
                { $or: [{ _id: id }, { postgresId: id }] },
                req.body,
                { new: true, runValidators: true }
            );
        } else {
            product = await Product.findOneAndUpdate(
                { postgresId: id },
                req.body,
                { new: true, runValidators: true }
            );
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Product (by _id or postgresId)
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        let product;
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findOneAndDelete({
                $or: [{ _id: id }, { postgresId: id }]
            });
        } else {
            product = await Product.findOneAndDelete({ postgresId: id });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};