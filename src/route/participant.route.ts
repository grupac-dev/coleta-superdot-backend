import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as ParticipantController from "../controller/participant.controller";
import {
    participantAcceptAllSampleDocsDTO,
    participantDataDTO,
    participantIndicateSecondSourcesDTO,
    participantSubmitAutobiographyDTO,
    validateEmailInSampleDTO,
    validateVerificationCodeDTO,
} from "../dto/participant.dto";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT";

const participantRouter = express.Router();

participantRouter.post(
    "/verifyParticipantEmail/sample/:sampleId",
    validateDTO(validateEmailInSampleDTO),
    ParticipantController.handlerValidateEmailInSample
);

participantRouter.patch(
    "/validateVerificationCode/sample/:sampleId",
    validateDTO(validateVerificationCodeDTO),
    ParticipantController.handlerValidateVerificationCode
);

participantRouter.post(
    "/submitParticipantData/sample/:sampleId",
    validateDTO(participantDataDTO),
    ParticipantController.handlerSubmitParticipantData
);

participantRouter.patch(
    "/acceptAllSampleDocs/sample/:sampleId",
    validateDTO(participantAcceptAllSampleDocsDTO),
    requireParticipantJWT,
    ParticipantController.handlerAcceptAllSampleDocs
);

participantRouter.post(
    "/indicateSecondSources/sample/:sampleId",
    validateDTO(participantIndicateSecondSourcesDTO),
    requireParticipantJWT,
    ParticipantController.handlerIndicateSecondSources
);

participantRouter.patch(
    "/submitAutobiography/sample/:sampleId",
    validateDTO(participantSubmitAutobiographyDTO),
    requireParticipantJWT,
    ParticipantController.handlerSubmitAutobiography
);

export { participantRouter };
