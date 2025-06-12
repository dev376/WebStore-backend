import express from "express";
const router = express.Router();
import {
    createCategory,
    updateCategory,
    removeCategory,
    listCategory,
    readCategory,
} from "../controllers/categoryControllers.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

router.route("/").post(authenticate, authorizeAdmin, createCategory);               //API Working
router.route("/:categoryId").put(authenticate, authorizeAdmin, updateCategory);     //API Working
router
    .route("/:categoryId")
    .delete(authenticate, authorizeAdmin, removeCategory);                          //API Working

router.route("/categories").get(listCategory);                                      //API Working
router.route("/:id").get(readCategory);                                             //API Working

export default router;
