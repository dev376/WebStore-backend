import express from "express";
import {
    createUser,
    loginUser,
    logoutCurrentUser,
    getAllUsers,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUserById,
    updateUserById,
    getUserById,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router
    .route("/")
    .post(createUser)                                       //API Working
    .get(authenticate, authorizeAdmin, getAllUsers);        //API Working

router.post("/auth", loginUser);                            //API Working
router.post("/logout", logoutCurrentUser);                  //API Working

router
    .route("/profile")
    .get(authenticate, getCurrentUserProfile)               //API Working
    .put(authenticate, updateCurrentUserProfile);           //API Working

//ADMIN ROUTES
router
    .route("/:id")
    .get(authenticate, authorizeAdmin, getUserById)         //API Working
    .put(authenticate, authorizeAdmin, updateUserById)      //API Working
    .delete(authenticate, authorizeAdmin, deleteUserById);  //API Woking

export default router;