import { EAdultFormGroup, EAdultFormSource } from "../util/consts";
import SourceQuestionsGroupModel from "../model/adultForm/sourceQuestionsGroup.model";
import IQuestionsGroup from "../interface/adultForm/questionsGroup.interface";
import { ISecondSource } from "../interface/secondSource.interface";
import { dispatchSecondSourceIndicationEmail } from "../util/emailSender.util";
import { findParticipantById } from "./participant.service";
import { getSampleById } from "./sample.service";
import { findSecondSourceById } from "./secondSource.service";
import { IParticipant } from "../interface/participant.interface";

interface GetQuestionsByGroupParams {
    sourceForm: EAdultFormSource;
    groupSequence: EAdultFormGroup;
}

/**
 * The function `getQuestionsByGroup` retrieves a group of questions based on the source form and group
 * sequence provided.
 * @param {EAdultFormSource} params.sourceForm - The `sourceForm` parameter is of type `EAdultFormSource` and
 * represents the source form number. It is used to filter the questions based on the source form.
 * @param {EAdultFormGroup} params.groupSequence - The `groupSequence` parameter is of type `EAdultFormGroup` and represents
 * the sequence of the group within the source form. It is used to filter and retrieve the questions
 * belonging to a specific group within the source form.
 * @returns an object that contains the group name, sequence, and an array of `IQuestions`.
 */
export async function getQuestionsByGroup({ sourceForm, groupSequence }: GetQuestionsByGroupParams) {
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

interface SaveGroupQuestionsParams {
    sampleId: string;
    participantId: string;
    groupQuestionsWithAnswers: IQuestionsGroup;
}

export async function saveGroupQuestions({
    sampleId,
    participantId,
    groupQuestionsWithAnswers,
}: SaveGroupQuestionsParams) {
    const { researcherDoc, sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    const groupWithPontuation = await calculatePunctuation(groupQuestionsWithAnswers, EAdultFormSource.FIRST_SOURCE);

    if (participant.adultForm?.answersByGroup) {
        const idxFromGroupAlreadyAdded = participant.adultForm?.answersByGroup?.findIndex(
            (group) => group.sequence === groupWithPontuation.sequence
        );

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

    return getQuestionsByGroup({
        sourceForm: EAdultFormSource.FIRST_SOURCE,
        groupSequence: groupWithPontuation.sequence + 1,
    });
}

interface SaveSecondSourceGroupQuestionsParams {
    secondSourceId: string;
    sampleId: string;
    participantId: string;
    groupQuestionsWithAnswers: IQuestionsGroup;
}

/**
 * The `saveSecondSourceGroupQuestions` function saves the answers of a second source for a specific
 * group of questions in a research sample.
 * @param {string} params.secondSourceId - The ID of the second source object.
 * @param {string} params.sampleId - The ID of a sample.
 * @param {string} params.participantId - The Id of the participant that owns the second source.
 * @param {IQuestionsGroup} params.groupQuestionsWithAnswers - An object of type `IQuestionsGroup`.
 * It represents the questions and answers for a specific group in the form.
 * @returns a boolean value if the last group was save. Otherwise, returns the next group of questions.
 */
export async function saveSecondSourceGroupQuestions({
    secondSourceId,
    sampleId,
    participantId,
    groupQuestionsWithAnswers,
}: SaveSecondSourceGroupQuestionsParams) {
    const { researcherDoc, sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    let secondSource = findSecondSourceById({ participant: participant as IParticipant, secondSourceId });

    const groupWithPontuation = await calculatePunctuation(groupQuestionsWithAnswers, EAdultFormSource.SECOND_SOURCE);

    if (!secondSource.adultForm) {
        throw new Error("Second source object haven't a adulForm object, then he don't start fill out the form.");
    }

    if (!secondSource.adultForm.answersByGroup) {
        secondSource.adultForm.answersByGroup = [];
    }

    const idxFormGroupAlreadyAdded = secondSource.adultForm.answersByGroup.findIndex(
        (group) => group.sequence === groupWithPontuation.sequence
    );

    if (idxFormGroupAlreadyAdded > -1) {
        secondSource.adultForm.answersByGroup[idxFormGroupAlreadyAdded] = groupWithPontuation;
    } else {
        secondSource.adultForm.answersByGroup.push(groupWithPontuation);
    }

    // Last group
    if (groupWithPontuation.sequence === EAdultFormGroup.ARTISTIC_ACTIVITIES) {
        secondSource.adultForm.endFillFormAt = new Date();
        await researcherDoc.save();
        return true;
    }

    await researcherDoc.save();

    return getQuestionsByGroup({
        sourceForm: EAdultFormSource.SECOND_SOURCE,
        groupSequence: groupWithPontuation.sequence + 1,
    });
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
