import express from "express";
// import formidable from "express-formidable";
const router = express.Router();

// controllers
import {
    addProduct,
    updateProductDetails,
    removeProduct,
    fetchProducts,
    fetchProductById,
    fetchAllProducts,
    addProductReview,
    fetchTopProducts,
    fetchNewProducts,
    filterProducts,
} from "../controllers/productController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";
import checkId from "../middlewares/checkId.js";

router
    .route("/")
    .post(authenticate, authorizeAdmin, addProduct)                             //API Working
    .get(fetchProducts);                                                        //API Working

router.route("/allproducts").get(fetchAllProducts);                             //API Working
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);

router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);

router
    .route("/:id")
    .put(authenticate, authorizeAdmin, updateProductDetails)                    //API Working
    .get(fetchProductById)                                                      //API Working
    .delete(authenticate, authorizeAdmin, removeProduct);                       //API Working

router.route("/filtered-products").post(filterProducts);

export default router;
