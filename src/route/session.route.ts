import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { createSessionDTO } from "../dto/createSession.dto";
import * as SessionController from "../controller/session.controller";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";

const sessionRouter = express.Router();

sessionRouter.post(
    "/new-session",
    validateDTO(createSessionDTO),
    SessionController.createSessionHandler
);

sessionRouter.delete(
    "/delete-session",
    requireActiveSession,
    SessionController.deleteSessionHandler
);

export { sessionRouter };
