import express from "express";
const router = express.Router();

import {
    createOrder,
    getAllOrders,
    getUserOrders,
    countTotalOrders,
    calculateTotalSales,
    calculateTotalSalesByDate,
    findOrderById,
    markOrderAsPaid,
    markOrderAsDelivered,
} from "../controllers/orderController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

router
    .route("/")
    .post(authenticate, createOrder)                                                                        //API Working
    .get(authenticate, authorizeAdmin, getAllOrders);                                                       //API Working

router.route("/mine").get(authenticate, getUserOrders);                                                     //API Working
router.route("/total-orders").get(authenticate, authorizeAdmin, countTotalOrders);                          //API Working
router.route("/total-sales").get(authenticate, authorizeAdmin, calculateTotalSales);                        //API Working
router.route("/total-sales-by-date").get(authenticate, authorizeAdmin, calculateTotalSalesByDate);          //API Working
router.route("/:id").get(authenticate, findOrderById);                                                      //API Working
router.route("/:id/pay").put(authenticate, markOrderAsPaid);                                                //API Working
router
    .route("/:id/deliver")
    .put(authenticate, authorizeAdmin, markOrderAsDelivered);                                                //API Working

export default router;
