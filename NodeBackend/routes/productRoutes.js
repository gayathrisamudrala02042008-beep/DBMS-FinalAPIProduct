import express from "express";

import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

import {
    verifyToken
} from "../middleware/authMiddleware.js";

import {
    isAdmin
} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post(
    "/",
    verifyToken,
    isAdmin,
    createProduct
);

router.put(
    "/:id",
    verifyToken,
    isAdmin,
    updateProduct
);

router.delete(
    "/:id",
    verifyToken,
    isAdmin,
    deleteProduct
);

export default router;