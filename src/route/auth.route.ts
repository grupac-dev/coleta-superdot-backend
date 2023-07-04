import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as AuthController from "../controller/auth.controller";
import { researcherDTO } from "../dto/researcher.dto";
import { uploaderConfig } from "../util/uploader";
import { loginDTO } from "../dto/login.dto";

const authRouter = express.Router();

authRouter.post(
    "/register",
    [uploaderConfig.single("personal_data[profile_photo]"), validateDTO(researcherDTO)],
    AuthController.registerHandler
);

authRouter.post("/login", [validateDTO(loginDTO)], AuthController.loginHandler);

authRouter.get("/isValidSession", AuthController.isValidSession);

export { authRouter };
