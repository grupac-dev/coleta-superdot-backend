import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ResearcherController from "../controller/researcher.controller";
import { paginateResearcherDTO, updateResearcherDTO } from "../dto/researcher.dto";
import { requireResearcherJWT } from "../middleware/requireResearcherJWT.middleware";
import { requireRole } from "../middleware/requireRole.middleware";
import { getResearcherNameBySampleIdSchema } from "../dto/researcher/getResearcherNameBySampleId.dto";

const researcherRouter = express.Router();

researcherRouter.put(
    "/update-researcher",
    [validateDTO(updateResearcherDTO), requireResearcherJWT],
    ResearcherController.updateResearcherHandler
);

researcherRouter.get(
    "/paginate/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateResearcherDTO), requireRole("Administrador")],
    ResearcherController.paginateResearchers
);

researcherRouter.get(
    "/get-researcher-name-by-sample/:sampleId",
    validateDTO(getResearcherNameBySampleIdSchema),
    ResearcherController.handlerGetReseacherNameBySampleId
);

export { researcherRouter };
