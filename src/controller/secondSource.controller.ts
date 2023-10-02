import { Request, Response } from "express";
import * as SecondSourceService from "../service/secondSource.service";
import { EmailAlreadyRegisteredError, ObjectNotExists } from "../error/participant.error";
import {
    SecondSourceAcceptAllSampleDocsDTO,
    SecondSourceDataDTO,
    ValidateEmailInParticipantSecondSourcesDTO,
    ValidateSecondSourceVerificationCodeDTO,
} from "../dto/secondSource.dto";
import { ISecondSource } from "../interface/secondSource.interface";

export async function handlerValidateEmailInParticipantSecondSources(
    req: Request<
        ValidateEmailInParticipantSecondSourcesDTO["params"],
        {},
        ValidateEmailInParticipantSecondSourcesDTO["body"],
        {}
    >,
    res: Response
) {
    try {
        const { secondSourceEmail } = req.body;
        const { participantId } = req.params;

        const valid = await SecondSourceService.validateEmail(secondSourceEmail, participantId);

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

export async function handlerValidateSecondSourceVerificationCode(
    req: Request<
        ValidateSecondSourceVerificationCodeDTO["params"],
        {},
        ValidateSecondSourceVerificationCodeDTO["body"],
        {}
    >,
    res: Response
) {
    try {
        const { secondSourceEmail, verificationCode } = req.body;

        const { participantId } = req.params;

        const token = await SecondSourceService.validateVerificationCode(
            secondSourceEmail,
            participantId,
            verificationCode
        );

        res.status(200).json(token);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function handlerSubmitSecondSourceData(
    req: Request<SecondSourceDataDTO["params"], {}, SecondSourceDataDTO["body"], {}>,
    res: Response
) {
    try {
        const secondSourceData: ISecondSource = req.body;
        const { sampleId, participantId } = req.params;

        const token = await SecondSourceService.saveSecondSourceData(sampleId, participantId, secondSourceData);

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
    req: Request<SecondSourceAcceptAllSampleDocsDTO["params"], {}, {}, {}>,
    res: Response
) {
    try {
        const { sampleId, participantId } = req.params;

        const secondSourceId = res.locals.participantId;

        if (!secondSourceId) {
            throw Error("Invalid second source JWT.");
        }

        const accepted = await SecondSourceService.acceptAllSampleDocs(sampleId, participantId, secondSourceId);

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
