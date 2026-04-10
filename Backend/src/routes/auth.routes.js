import express from "express";
import { googleAuth, login, logout, signUp } from "../controller/auth.controllers.js";

const authRoute = express.Router();

authRoute.post("/signup", signUp);
authRoute.post("/login", login);
authRoute.get("/logout", logout);


authRoute.post("/google-auth", googleAuth);

export default authRoute;
