import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ResearcherController from "../controller/researcher.controller";
import { updateResearcherDTO } from "../dto/researcher.dto";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";

const researcherRouter = express.Router();

researcherRouter.put(
    "/update-researcher",
    [validateDTO(updateResearcherDTO), requireActiveSession],
    ResearcherController.updateResearcherHandler
);

export { researcherRouter };
