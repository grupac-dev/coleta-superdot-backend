import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as SecondSourceController from "../controller/secondSource.controller";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT.middleware";
import {
    secondSourceAcceptAllSampleDocsDTO,
    secondSourceDataDTO,
    validateSecondSourceVerificationCodeDTO,
} from "../dto/secondSource.dto";
import { sendValidationSecondSourceEmailSchema } from "../dto/secondSource/sendValidationSecondSourceEmail.dto";

const secondSourceRouter = express.Router();

secondSourceRouter.post(
    "/send-verification-code/sample/:sampleId/participant/:participantId",
    validateDTO(sendValidationSecondSourceEmailSchema),
    SecondSourceController.handlerSendVerificationEmail
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
