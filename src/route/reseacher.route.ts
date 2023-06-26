import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ResearcherController from "../controller/researcher.controller";
import { createResearcherDTO } from "../dto/createResearcher.dto";
import { updateResearcherDTO } from "../dto/updateResearcher.dto";

const researcherRouter = express.Router();

researcherRouter.post(
    "/new-researcher",
    validateDTO(createResearcherDTO),
    ResearcherController.createResearcherHandler
);

researcherRouter.put(
    "/update-researcher",
    validateDTO(updateResearcherDTO),
    ResearcherController.updateResearcherHandler
);

export { researcherRouter };
