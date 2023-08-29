import { Request, Response } from "express";
import * as AdultFormService from "../service/adultForm.service";
import { AdultFormParticipantDataDTO } from "../dto/adultForm.dto";
import { IParticipant } from "../interface/participant.interface";

export async function handlerStartFillForm(
    req: Request<AdultFormParticipantDataDTO["params"], {}, AdultFormParticipantDataDTO["body"], {}>,
    res: Response
) {
    try {
        const participantPersonalData: IParticipant = req.body;
        const { sampleId } = req.params;

        const participantToken = await AdultFormService.createParticipant(sampleId, participantPersonalData);

        res.status(200).json({ participantToken });
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
