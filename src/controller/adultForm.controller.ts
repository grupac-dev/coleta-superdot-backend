import { Request, Response } from "express";
import * as AdultFormService from "../service/adultForm.service";
import {
    AdultFormAcceptDocsDTO,
    AdultFormIndicateSecondSourceDTO,
    AdultFormParticipantDataDTO,
} from "../dto/adultForm.dto";
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

export async function handlerAcceptDocs(req: Request<AdultFormAcceptDocsDTO["params"], {}, {}, {}>, res: Response) {
    try {
        const { sampleId } = req.params;

        const participantId = res.locals.participantId;

        if (!participantId) {
            console.error("(Invalid JWT) Error in handlerAcceptDocs from adultForm.controller.ts");
            throw Error("Invalid participant JWT.");
        }

        const accepted = await AdultFormService.acceptDocs(sampleId, participantId);

        if (!accepted) {
            console.error("(Cannot accept docs) Error in handlerAcceptDocs from adultForm.controller.ts");
            throw Error("Cannot accept sample docs.");
        }

        res.status(200).json(accepted);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function handlerIndicateSecondSources(
    req: Request<AdultFormIndicateSecondSourceDTO["params"], {}, AdultFormIndicateSecondSourceDTO["body"], {}>,
    res: Response
) {
    try {
        const { sampleId } = req.params;
        const secondSources = req.body.secondSources.map((secondSource) => {
            return {
                personalData: {
                    ...secondSource,
                },
            };
        });

        const participantId = res.locals.participantId;
        if (!participantId) {
            console.error("(Invalid JWT) Error in handlerIndicateSecondSources from adultForm.controller.ts");
            throw Error("Invalid participant JWT.");
        }

        const created = await AdultFormService.createSecondSource(sampleId, participantId, secondSources);

        if (!created) {
            console.error(
                "(Cannot create second source) Error in handlerIndicateSecondSources from adultForm.controller.ts"
            );
            throw Error("Cannot accept sample docs.");
        }

        res.status(200).json(created);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
