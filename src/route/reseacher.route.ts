import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ResearcherController from "../controller/researcher.controller";
import { paginateResearcherDTO, updateResearcherDTO } from "../dto/researcher.dto";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";
import { requireRole } from "../middleware/requireRole.middleware";

const researcherRouter = express.Router();

researcherRouter.put(
    "/update-researcher",
    [validateDTO(updateResearcherDTO), requireActiveSession],
    ResearcherController.updateResearcherHandler
);

researcherRouter.get(
    "/paginate/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateResearcherDTO), requireRole("Administrador")],
    ResearcherController.paginateResearchers
);

export { researcherRouter };
