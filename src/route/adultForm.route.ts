import express from "express";
import { validateDTO } from "../middleware/validateDTO.middleware";
import { adultFormParticipantDataDTO } from "../dto/adultForm.dto";
import * as AdultFormController from "../controller/adultForm.controller";

const adultFormRoute = express.Router();

adultFormRoute.post(
    "/startFillForm/:sampleId",
    validateDTO(adultFormParticipantDataDTO),
    AdultFormController.handlerStartFillForm
);

export { adultFormRoute };
