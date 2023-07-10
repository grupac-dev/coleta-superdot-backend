import express from "express";
import * as SampleController from "../controller/sample.controller";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";
import { createSampleDTO, paginateSampleDTO } from "../dto/sample.dto";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { uploaderConfig } from "../util/uploader";
import { requireRole } from "../middleware/requireRole.middleware";
import { protectResource } from "../middleware/protectResource.middleware";

const sampleRouter = express.Router();

sampleRouter.post(
    "/newSample",
    [
        uploaderConfig.fields([
            { name: "research_cep[research_document]", maxCount: 1 },
            { name: "research_cep[tcle_document]", maxCount: 1 },
            { name: "research_cep[tale_document]", maxCount: 1 },
        ]),
        validateDTO(createSampleDTO),
        requireActiveSession,
    ],
    SampleController.createSampleHandler
);

sampleRouter.get(
    "/paginate/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateSampleDTO), requireActiveSession],
    SampleController.paginateResearcherSamples
);

sampleRouter.get(
    "/paginateAll/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateSampleDTO), requireRole("Revisor")],
    SampleController.paginateAllSamples
);

sampleRouter.use("/attachment", protectResource, express.static("src/storage/uploads"));

export { sampleRouter };
