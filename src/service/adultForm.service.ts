import { EAdultFormGroup, EAdultFormSource, EAdultFormSteps, EQuestionType } from "../util/consts";
import SourceQuestionsGroupModel from "../model/adultForm/sourceQuestionsGroup.model";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";
import IQuestion from "../interface/adultForm/question.interface";
import { ISecondSource } from "../interface/secondSource.interface";
import { dispatchSecondSourceIndicationEmail } from "../util/emailSender.util";
import { findParticipantById } from "./participant.service";
import { getSampleById } from "./sample.service";

// The quantity of form steps that exists before the participant start answer the form groups questions.
const QTT_STEP_BEFORE_GROUPS_QUESTIONS = 4;

export async function getQuestionsByGroup(sourceForm: EAdultFormSource, groupSequence: EAdultFormGroup) {
    const sourceQuestionsGroup = await SourceQuestionsGroupModel.aggregate<IQuestionsGroup>()
        .match({ source: Number(sourceForm) })
        .unwind("$groups")
        .match({ "groups.sequence": Number(groupSequence) })
        .project({
            _id: false,
            groupName: "$groups.groupName",
            sequence: "$groups.sequence",
            questions: "$groups.questions",
        });

    if (!sourceQuestionsGroup || sourceQuestionsGroup.length !== 1) {
        throw Error("Group questions not found");
    }

    return sourceQuestionsGroup[0];
}

export async function saveGroupQuestions(
    sampleId: string,
    participantId: string,
    groupQuestionsAndAnswers: IQuestionsGroup,
    secondSourceId?: string
) {
    const { researcherDoc, sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    // // The participant is a second source
    // if (secondSourceId) {
    //     const secondSource = participant.secondSources?.find(
    //         (secondSource) => secondSource._id?.toString() === secondSourceId
    //     );

    //     if (!secondSource) {
    //         throw new Error("Second source not found.");
    //     }

    //     const groupWithPontuation = await calculatePontuation(groupQuestionsAndAnswers, EAdultFormSource.SECOND_SOURCE);

    //     if (secondSource.adultFormAnswers) {
    //         secondSource.adultFormAnswers?.push(groupWithPontuation);
    //     } else {
    //         secondSource.adultFormAnswers = [groupWithPontuation];
    //     }

    //     // Next FORM step.
    //     // Form steps can be: 0 - 10 (see EAdultFormGroup)
    //     // Group questions can be: 0 - 5 (see EAdultFormSteps)
    //     secondSource.adultFormCurrentStep = QTT_STEP_BEFORE_GROUPS_QUESTIONS + groupWithPontuation.sequence + 1;

    //     let returnValue: IGroupQuestionsWithoutPoints | boolean = true;

    //     // Last group
    //     if (groupWithPontuation.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
    //         // Jump autobiography
    //         secondSource.adultFormCurrentStep = EAdultFormSteps.FINISHED;
    //         secondSource.endFillFormDate = new Date().toISOString();
    //     } else {
    //         returnValue = await getQuestionsByGroup(EAdultFormSource.SECOND_SOURCE, groupWithPontuation.sequence + 1);
    //     }

    //     await researcherDoc.save();

    //     return returnValue;
    // }

    const groupWithPontuation = await calculatePunctuation(groupQuestionsAndAnswers, EAdultFormSource.FIRST_SOURCE);

    if (participant.adultForm?.answersByGroup) {
        const idxFromGroupAlreadyAdded = participant.adultForm?.answersByGroup?.findIndex(
            (group) => group.sequence === groupWithPontuation.sequence
        );

        console.log(idxFromGroupAlreadyAdded);

        if (idxFromGroupAlreadyAdded > -1) {
            participant.adultForm.answersByGroup[idxFromGroupAlreadyAdded] = groupWithPontuation;
        } else {
            participant.adultForm.answersByGroup.push(groupWithPontuation);
        }
    } else {
        participant.adultForm?.answersByGroup?.push(groupWithPontuation);
    }

    await researcherDoc.save();

    // Last group
    if (groupWithPontuation.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
        return true;
    }

    return getQuestionsByGroup(EAdultFormSource.FIRST_SOURCE, groupWithPontuation.sequence + 1);
}

/**
 * The function calculates the punctuation for a participant's answers based on a set of questions and
 * their corresponding options.
 * @param {IQuestionsGroup} participantAnswers - The `participantAnswers` parameter is an object of
 * type `IQuestionsGroup`, which represents the answers provided by a participant for a group of
 * questions.
 * @param {EAdultFormSource} source - The `source` parameter is of type `EAdultFormSource`, which is an
 * enum representing the source of the adult form. It could have values like
 * `EAdultFormSource.FIRST_SOURCE` or `EAdultFormSource.SECOND_SOURCE`.
 * @returns an object that contains the participant's answers with punctuation calculated for each
 * question.
 */
export async function calculatePunctuation(participantAnswers: IQuestionsGroup, source: EAdultFormSource) {
    const sourceGroup = await SourceQuestionsGroupModel.findOne({ source });

    const group = sourceGroup?.groups.find((group) => group.sequence === participantAnswers.sequence);

    if (!group) {
        throw new Error("Group not found.");
    }

    const questionsWithPontuation = participantAnswers.questions.map((question) => {
        const questionInDB = group.questions.find((questionDB) => questionDB._id === question._id);

        if (!questionInDB) return question;

        if (!questionInDB.options) return question;

        return {
            ...question,
            options: questionInDB.options, // Avoid changing punctuation in frontend
            answerPoints: questionInDB.options.find((option) => option.value === question.answer)?.points,
        };
    });

    return {
        ...participantAnswers,
        questions: questionsWithPontuation,
    };
}

interface FinishFormParams {
    participantId: string;
    sampleId: string;
    secondSourcesToDispatchEmails: ISecondSource[];
}

export async function finishForm({ participantId, sampleId, secondSourcesToDispatchEmails }: FinishFormParams) {
    const { researcherDoc, sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    if (participant.adultForm) {
        participant.adultForm.endFillFormAt = new Date();
    }

    participant.verification = undefined;

    await researcherDoc.save();

    secondSourcesToDispatchEmails.forEach((secondSource) => {
        dispatchSecondSourceIndicationEmail({
            participantName: participant.personalData?.fullName as string,
            participantEmail: participant.personalData?.email as string,
            secondSourceName: secondSource.personalData.fullName,
            secondSourceEmail: secondSource.personalData.email,
            participantId: participantId,
            sampleId: sampleId,
        });
    });
}
