import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ResearcherController from "../controller/researcher.controller";
import { createResearcherDTO } from "../dto/researcher.dto";
import { updateResearcherDTO } from "../dto/researcher.dto";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";

const researcherRouter = express.Router();

researcherRouter.post(
    "/new-researcher",
    validateDTO(createResearcherDTO),
    ResearcherController.createResearcherHandler
);

researcherRouter.put(
    "/update-researcher",
    [validateDTO(updateResearcherDTO), requireActiveSession],
    ResearcherController.updateResearcherHandler
);

export { researcherRouter };
