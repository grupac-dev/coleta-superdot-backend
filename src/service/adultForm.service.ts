import ResearcherModel from "../model/researcher.model";
import { signJwt } from "../util/jwt";
import env from "../util/validateEnv";
import mongoose from "mongoose";
import { EAdultFormGroup, EAdultFormSource, EAdultFormSteps, EQuestionType } from "../util/consts";
import SourceQuestionsGroupModel from "../model/adultForm/sourceQuestionsGroup.model";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";
import IQuestion from "../interface/adultForm/question.interface";

// The quantity of form steps that exists before the participant start answer the form groups questions.
const QTT_STEP_BEFORE_GROUPS_QUESTIONS = 4;

export function issueParticipantToken(participantId: string) {
    const accessToken = signJwt(
        {
            participantId,
        },
        "ACCESS_TOKEN_PRIVATE_KEY",
        {
            expiresIn: env.ACCESS_TOKEN_TTL,
        }
    );

    return accessToken;
}

interface IQuestionWithoutPoints extends Omit<IQuestion, "options"> {
    options: string[];
}

interface IGroupQuestionsWithoutPoints extends Omit<IQuestionsGroup, "questions"> {
    questions: IQuestionWithoutPoints;
}

export async function getQuestionsByGroup(sourceForm: EAdultFormSource, groupSequence: EAdultFormGroup) {
    const sourceQuestionsGroup = await SourceQuestionsGroupModel.aggregate<IGroupQuestionsWithoutPoints>()
        .match({ source: Number(sourceForm) })
        .unwind("$groups")
        .match({ "groups.sequence": Number(groupSequence) })
        .project({
            _id: false,
            groupName: "$groups.groupName",
            sequence: "$groups.sequence",
            questions: {
                $map: {
                    input: "$groups.questions",
                    in: {
                        _id: "$$this._id",
                        sequence: "$$this.sequence",
                        questionType: "$$this.questionType",
                        statement: "$$this.statement",
                        options: {
                            $map: {
                                input: "$$this.options",
                                in: "$$this.value",
                            },
                        },
                        notRequired: "$$this.notRequired",
                    },
                },
            },
        });

    if (!sourceQuestionsGroup || sourceQuestionsGroup.length !== 1) {
        throw Error("Group questions not found");
    }

    return sourceQuestionsGroup[0];
}

export async function submitGroupQuestions(
    sampleId: string,
    participantId: string,
    groupQuestionsAndAnswers: IQuestionsGroup,
    secondSourceId?: string
) {
    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        throw new Error("Sample id is invalid.");
    }

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
        throw new Error("Participant id is invalid.");
    }

    const researcherDoc = await ResearcherModel.findOne({ "researchSamples._id": sampleId });

    if (!researcherDoc || !researcherDoc.researchSamples) {
        throw new Error("Sample not found.");
    }

    const sample = researcherDoc.researchSamples.find((sample) => sample._id?.toString() === sampleId);

    if (!sample) {
        throw new Error("Sample not found.");
    }

    const participant = sample.participants?.find((participant) => participant._id?.toString() === participantId);

    if (!participant) {
        throw new Error("Participant not found.");
    }

    // The participant is a second source
    if (secondSourceId) {
        const secondSource = participant.secondSources?.find(
            (secondSource) => secondSource._id?.toString() === secondSourceId
        );

        if (!secondSource) {
            throw new Error("Second source not found.");
        }

        const groupWithPontuation = await calculatePontuation(groupQuestionsAndAnswers, EAdultFormSource.SECOND_SOURCE);

        if (secondSource.adultFormAnswers) {
            secondSource.adultFormAnswers?.push(groupWithPontuation);
        } else {
            secondSource.adultFormAnswers = [groupWithPontuation];
        }

        // Next FORM step.
        // Form steps can be: 0 - 10 (see EAdultFormGroup)
        // Group questions can be: 0 - 5 (see EAdultFormSteps)
        secondSource.adultFormCurrentStep = QTT_STEP_BEFORE_GROUPS_QUESTIONS + groupWithPontuation.sequence + 1;

        let returnValue: IGroupQuestionsWithoutPoints | boolean = true;

        // Last group
        if (groupWithPontuation.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
            // Jump autobiography
            secondSource.adultFormCurrentStep = EAdultFormSteps.FINISHED;
            secondSource.endFillFormDate = new Date().toISOString();
        } else {
            returnValue = await getQuestionsByGroup(EAdultFormSource.SECOND_SOURCE, groupWithPontuation.sequence + 1);
        }

        await researcherDoc.save();

        return returnValue;
    }

    const groupWithPontuation = await calculatePontuation(groupQuestionsAndAnswers, EAdultFormSource.FIRST_SOURCE);

    // Participant is first source
    if (participant.adultFormAnswers) {
        participant.adultFormAnswers?.push(groupWithPontuation);
    } else {
        participant.adultFormAnswers = [groupWithPontuation];
    }

    // Next FORM step.
    // Form steps can be: 0 - 10 (see EAdultFormGroup)
    // Group questions can be: 0 - 5 (see EAdultFormSteps)
    participant.adultFormCurrentStep = QTT_STEP_BEFORE_GROUPS_QUESTIONS + groupWithPontuation.sequence + 1;

    await researcherDoc.save();

    // Last group
    if (groupWithPontuation.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
        return true;
    }

    return getQuestionsByGroup(EAdultFormSource.FIRST_SOURCE, groupWithPontuation.sequence + 1);
}

export async function calculatePontuation(participantAnswers: IQuestionsGroup, source: EAdultFormSource) {
    const sourceGroup = await SourceQuestionsGroupModel.findOne({ source });

    const group = sourceGroup?.groups.find((group) => group.sequence === participantAnswers.sequence);

    if (!group) {
        throw new Error("Group not found.");
    }

    const questionsWithPontuation = participantAnswers.questions.map((question) => {
        const questionInDB = group.questions.find((questionDB) => questionDB.sequence === question.sequence);

        if (!questionInDB) return question;

        if (!questionInDB.options) return question;

        // The answer doesn't impact in the pontuation, only is necessary to have a answer
        if (questionInDB.constantPunctuation && question.answer) {
            if (question.answer)
                return {
                    ...question,
                    answerPoints: questionInDB.constantPunctuation,
                };
        }

        return {
            ...question,
            answerPoints: questionInDB.options.find((option) => option.value === question.answer)?.points,
        };
    });

    return {
        ...participantAnswers,
        questions: questionsWithPontuation,
    };
}
