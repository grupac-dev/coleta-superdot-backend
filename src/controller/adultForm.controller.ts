import { Request, Response } from "express";
import * as AdultFormService from "../service/adultForm.service";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";
import { GetQuestionsByGroupDTO } from "../dto/adultForm/getQuestionsByGroup.dto";
import { SaveQuestionsByGroupDTO } from "../dto/adultForm/saveQuestionsByGroup.dto";

export async function handlerGetQuestionsByGroup(
    req: Request<GetQuestionsByGroupDTO["params"], {}, {}, {}>,
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

export async function handlerSaveQuestionsByGroup(
    req: Request<SaveQuestionsByGroupDTO["params"], {}, SaveQuestionsByGroupDTO["body"], {}>,
    res: Response
) {
    try {
        let { sampleId } = req.params;

        const participantId = res.locals.participantId; // Participant ID in JWT Token

        const groupQuestionsWithAnswers: IQuestionsGroup = req.body;

        const response = await AdultFormService.saveGroupQuestions(
            sampleId,
            participantId as string,
            groupQuestionsWithAnswers
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
