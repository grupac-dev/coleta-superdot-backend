import ResearcherModel from "../model/researcher.model";
import { signJwt } from "../util/jwt";
import env from "../util/validateEnv";
import mongoose from "mongoose";
import { EAdultFormGroup, EAdultFormSource, EAdultFormSteps } from "../util/consts";
import SourceQuestionsGroupModel from "../model/adultForm/sourceQuestionsGroup.model";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";

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

export async function getQuestionsByGroup(source: EAdultFormSource, groupSequence: EAdultFormGroup) {
    const sourceQuestionsGroup = await SourceQuestionsGroupModel.findOne({
        source,
        "groups.sequence": groupSequence,
    });

    if (!sourceQuestionsGroup || !sourceQuestionsGroup.groups) {
        throw Error("Group questions not found");
    }

    const group = sourceQuestionsGroup.groups.find((group) => Number(group.sequence) === Number(groupSequence));

    if (!group) {
        throw Error("Group questions not found");
    }

    return group;
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

        if (secondSource.adultFormAnswers) {
            secondSource.adultFormAnswers?.push(groupQuestionsAndAnswers);
        } else {
            secondSource.adultFormAnswers = [groupQuestionsAndAnswers];
        }

        // Next FORM step.
        // Form steps can be: 0 - 10 (see EAdultFormGroup)
        // Group questions can be: 0 - 5 (see EAdultFormSteps)
        secondSource.adultFormCurrentStep = QTT_STEP_BEFORE_GROUPS_QUESTIONS + groupQuestionsAndAnswers.sequence + 1;

        let returnValue: IQuestionsGroup | boolean = true;

        // Last group
        if (groupQuestionsAndAnswers.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
            // Jump autobiography
            secondSource.adultFormCurrentStep = EAdultFormSteps.FINISHED;
            secondSource.endFillFormDate = new Date().toISOString();
        } else {
            returnValue = await getQuestionsByGroup(
                EAdultFormSource.SECOND_SOURCE,
                groupQuestionsAndAnswers.sequence + 1
            );
        }

        await researcherDoc.save();

        return returnValue;
    }

    // Participant is first source
    if (participant.adultFormAnswers) {
        participant.adultFormAnswers?.push(groupQuestionsAndAnswers);
    } else {
        participant.adultFormAnswers = [groupQuestionsAndAnswers];
    }

    // Next FORM step.
    // Form steps can be: 0 - 10 (see EAdultFormGroup)
    // Group questions can be: 0 - 5 (see EAdultFormSteps)
    participant.adultFormCurrentStep = QTT_STEP_BEFORE_GROUPS_QUESTIONS + groupQuestionsAndAnswers.sequence + 1;

    await researcherDoc.save();

    // Last group
    if (groupQuestionsAndAnswers.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
        return true;
    }

    return getQuestionsByGroup(EAdultFormSource.FIRST_SOURCE, groupQuestionsAndAnswers.sequence + 1);
}
