import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import * as SecondSourceController from "../controller/secondSource.controller";
import { requireParticipantJWT } from "../middleware/requireParticipantJWT.middleware";
import { secondSourceAcceptAllSampleDocsDTO, secondSourceDataDTO } from "../dto/secondSource.dto";
import { sendValidationSecondSourceEmailSchema } from "../dto/secondSource/sendValidationSecondSourceEmail.dto";
import { validateSecondSourceVerificationCodeSchema } from "../dto/secondSource/validateSecondSourceVerificationCode.dto";

const secondSourceRouter = express.Router();

secondSourceRouter.post(
    "/send-verification-code/sample/:sampleId/participant/:participantId",
    validateDTO(sendValidationSecondSourceEmailSchema),
    SecondSourceController.handlerSendVerificationEmail
);

secondSourceRouter.patch(
    "/validate-verification-code/sample/:sampleId/participant/:participantId/second-source/:secondSourceId/code/:verificationCode",
    validateDTO(validateSecondSourceVerificationCodeSchema),
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
