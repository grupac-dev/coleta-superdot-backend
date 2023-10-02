import { Request, Response } from "express";
import * as ParticipantService from "../service/participant.service";
import {
    ParticipantAcceptAllSampleDocsDTO,
    ParticipantDataDTO,
    ParticipantIndicateSecondSourcesDTO,
    ParticipantSubmitAutobiographyDTO,
    ValidateEmailInSampleDTO,
    ValidateVerificationCodeDTO,
} from "../dto/participant.dto";
import { IParticipant } from "../interface/participant.interface";
import { EmailAlreadyRegisteredError, ObjectNotExists } from "../error/participant.error";

export async function handlerValidateEmailInSample(
    req: Request<ValidateEmailInSampleDTO["params"], {}, ValidateEmailInSampleDTO["body"], {}>,
    res: Response
) {
    try {
        const { participantEmail } = req.body;
        const { sampleId } = req.params;

        const valid = await ParticipantService.validateEmail(participantEmail, sampleId);

        res.status(200).json(valid);
    } catch (e: any) {
        console.log(e);

        if (e instanceof EmailAlreadyRegisteredError) {
            return res.status(409).send(e.message);
        }

        if (e instanceof ObjectNotExists) {
            return res.status(404).send(e.message);
        }

        // TO DO errors handlers
        res.status(500).send(e.message);
    }
}

export async function handlerValidateVerificationCode(
    req: Request<ValidateVerificationCodeDTO["params"], {}, ValidateVerificationCodeDTO["body"], {}>,
    res: Response
) {
    try {
        const { participantEmail, verificationCode } = req.body;
        const { sampleId } = req.params;

        const token = await ParticipantService.validateVerificationCode(participantEmail, sampleId, verificationCode);

        res.status(200).json(token);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function handlerSubmitParticipantData(
    req: Request<ParticipantDataDTO["params"], {}, ParticipantDataDTO["body"], {}>,
    res: Response
) {
    try {
        const participantData: IParticipant = req.body;
        const { sampleId } = req.params;

        const token = await ParticipantService.saveParticipantData(sampleId, participantData);

        res.status(201).json(token);
    } catch (e: any) {
        console.log(e);

        if (e instanceof ObjectNotExists) {
            return res.status(404).send(e.message);
        }

        // TO DO errors handlers
        res.status(500).send(e.message);
    }
}

export async function handlerAcceptAllSampleDocs(
    req: Request<ParticipantAcceptAllSampleDocsDTO["params"], {}, {}, {}>,
    res: Response
) {
    try {
        const { sampleId } = req.params;

        const participantId = res.locals.participantId;

        if (!participantId) {
            throw Error("Invalid participant JWT.");
        }

        const accepted = await ParticipantService.acceptAllSampleDocs(sampleId, participantId);

        if (!accepted) {
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
    req: Request<ParticipantIndicateSecondSourcesDTO["params"], {}, ParticipantIndicateSecondSourcesDTO["body"], {}>,
    res: Response
) {
    try {
        const { sampleId } = req.params;
        const secondSources = req.body.secondSources;

        const participantId = res.locals.participantId;
        if (!participantId) {
            throw Error("Invalid participant JWT.");
        }

        const created = await ParticipantService.saveSecondSources(sampleId, participantId, secondSources);

        if (!created) {
            throw Error("Cannot accept save the second source info.");
        }

        res.status(200).json(created);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function handlerSubmitAutobiography(
    req: Request<ParticipantSubmitAutobiographyDTO["params"], {}, ParticipantSubmitAutobiographyDTO["body"], {}>,
    res: Response
) {
    try {
        const { sampleId } = req.params;
        const { autobiographyText, autobiographyVideo } = req.body;

        const participantId = res.locals.participantId;
        if (!participantId) {
            throw Error("Invalid participant JWT.");
        }

        const response = await ParticipantService.saveAutobiography(
            sampleId,
            participantId,
            autobiographyVideo,
            autobiographyText
        );

        if (!response) {
            throw Error("Cannot submit this autobiography.");
        }

        res.status(200).json(response);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
