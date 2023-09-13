import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as SecondSourceController from "../controller/secondSource.controller";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT";
import {
    secondSourceAcceptAllSampleDocsDTO,
    secondSourceDataDTO,
    validateEmailInParticipantSecondSourcesDTO,
    validateSecondSourceVerificationCodeDTO,
} from "../dto/secondSource.dto";

const secondSourceRouter = express.Router();

secondSourceRouter.post(
    "/verifySecondSourceEmail/sample/:sampleId/participant/:participantId",
    validateDTO(validateEmailInParticipantSecondSourcesDTO),
    SecondSourceController.handlerValidateEmailInParticipantSecondSources
);

secondSourceRouter.patch(
    "/validateSecondSourceVerificationCode/participant/:participantId",
    validateDTO(validateSecondSourceVerificationCodeDTO),
    SecondSourceController.handlerValidateSecondSourceVerificationCode
);

secondSourceRouter.post(
    "/submitSecondSourceData/sample/:sampleId/participant/:participantId",
    validateDTO(secondSourceDataDTO),
    SecondSourceController.handlerSubmitSecondSourceData
);

secondSourceRouter.patch(
    "/acceptAllSampleDocs/sample/:sampleId/participant/:participantId",
    validateDTO(secondSourceAcceptAllSampleDocsDTO),
    requireParticipantJWT,
    SecondSourceController.handlerAcceptAllSampleDocs
);

export { secondSourceRouter };
