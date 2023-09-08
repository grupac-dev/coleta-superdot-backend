import { Request, Response } from "express";
import * as AdultFormService from "../service/adultForm.service";
import { AdultFormAllQuestionsByGroupDTO, AdultFormSubmitQuestionsByGroupDTO } from "../dto/adultForm.dto";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";

export async function handlerGetQuestionsByGroup(
    req: Request<AdultFormAllQuestionsByGroupDTO["params"], {}, {}, {}>,
    res: Response
) {
    try {
        const { groupSequence, formSource } = req.params;

        const participantId = res.locals.participantId;
        if (!participantId) {
            throw Error("Invalid participant JWT.");
        }

        const groupQuestions = await AdultFormService.getQuestionsByGroup(formSource, groupSequence);

        if (!groupQuestions) {
            throw Error("Group questions not found");
        }

        res.status(200).json(groupQuestions);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function handlerSubmitQuestionsByGroup(
    req: Request<AdultFormSubmitQuestionsByGroupDTO["params"], {}, AdultFormSubmitQuestionsByGroupDTO["body"], {}>,
    res: Response
) {
    try {
        let { sampleId, participantId } = req.params;

        let secondSourceId;

        if (!participantId) {
            participantId = res.locals.participantId; // Participant ID in JWT Token
        } else {
            secondSourceId = res.locals.participantId; // Second Source ID in JWT Token
        }

        const groupQuestionsWithAnswers: IQuestionsGroup = req.body;

        const response = await AdultFormService.submitGroupQuestions(
            sampleId,
            participantId as string,
            groupQuestionsWithAnswers,
            secondSourceId
        );

        if (!response) {
            throw Error("Cannot submit these questions.");
        }

        res.status(200).json(response);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
