import express from "express";
import * as SampleController from "../controller/sample.controller";
import { requireActiveSession } from "../middleware/requireActiveSession.middleware";
import {
    createSampleDTO,
    deleteSampleDTO,
    editSampleDTO,
    getRequiredDocsDTO,
    paginateAllSampleDTO,
    paginateSampleDTO,
} from "../dto/sample.dto";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { uploaderConfig } from "../util/uploader";
import { requireRole } from "../middleware/requireRole.middleware";
import { protectResource } from "../middleware/protectResource.middleware";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT";

const sampleRouter = express.Router();

const uploaderFields = uploaderConfig.fields([
    { name: "researchCep[researchDocument]", maxCount: 1 },
    { name: "researchCep[tcleDocument]", maxCount: 1 },
    { name: "researchCep[taleDocument]", maxCount: 1 },
]);

sampleRouter.post(
    "/newSample",
    [uploaderFields, validateDTO(createSampleDTO), requireActiveSession],
    SampleController.createSampleHandler
);
sampleRouter.put(
    "/updateSample/:sampleId",
    [uploaderFields, validateDTO(editSampleDTO), requireActiveSession],
    SampleController.editSampleHandler
);

sampleRouter.get(
    "/paginate/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateSampleDTO), requireActiveSession],
    SampleController.paginateResearcherSamples
);

sampleRouter.get(
    "/paginateAll/:itemsPerPage/page/:currentPage",
    [validateDTO(paginateAllSampleDTO), requireRole("Revisor")],
    SampleController.paginateAllSamples
);

sampleRouter.get(
    "/listRequiredDocs/:sampleId",
    [validateDTO(getRequiredDocsDTO), requireParticipantJWT],
    SampleController.handlerGetRequiredDocs
);

sampleRouter.use("/attachment", express.static("src/storage/uploads"));

sampleRouter.delete(
    "/deleteSample/:sampleId",
    [validateDTO(deleteSampleDTO), requireActiveSession],
    SampleController.deleteSample
);

export { sampleRouter };
