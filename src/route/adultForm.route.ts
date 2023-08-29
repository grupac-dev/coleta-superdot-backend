import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { adultFormAcceptDocsDTO, adultFormParticipantDataDTO } from "../dto/adultForm.dto";
import * as AdultFormController from "../controller/adultForm.controller";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT";

const adultFormRoute = express.Router();

adultFormRoute.post(
    "/startFillForm/:sampleId",
    validateDTO(adultFormParticipantDataDTO),
    AdultFormController.handlerStartFillForm
);

adultFormRoute.patch(
    "/acceptDocs/sample/:sampleId/participant/:participantId",
    validateDTO(adultFormAcceptDocsDTO),
    requireParticipantJWT,
    AdultFormController.handlerAcceptDocs
);

export { adultFormRoute };
