import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { adultFormAllQuestionsByGroupDTO, adultFormSubmitQuestionsByGroupDTO } from "../dto/adultForm.dto";
import * as AdultFormController from "../controller/adultForm.controller";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT";

const adultFormRoute = express.Router();

adultFormRoute.get(
    "/allQuestionsByGroup/:groupSequence/source/:formSource",
    validateDTO(adultFormAllQuestionsByGroupDTO),
    requireParticipantJWT,
    AdultFormController.handlerGetQuestionsByGroup
);

adultFormRoute.patch(
    "/submitGroupQuestions/sample/:sampleId",
    validateDTO(adultFormSubmitQuestionsByGroupDTO),
    requireParticipantJWT,
    AdultFormController.handlerSubmitQuestionsByGroup
);

adultFormRoute.patch(
    "/submitGroupQuestions/sample/:sampleId/participant/:participantId",
    validateDTO(adultFormSubmitQuestionsByGroupDTO),
    requireParticipantJWT,
    AdultFormController.handlerSubmitQuestionsByGroup
);

export { adultFormRoute };
