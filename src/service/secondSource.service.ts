import ResearcherModel from "../model/researcher.model";
import { ISecondSource } from "../interface/secondSource.interface";
import ParticipantSessionModel from "../model/participantSession.model";
import { dispatchSecondSourceVerificationEmail } from "../util/emailSender.util";
import { DateTime } from "luxon";
import { EAdultFormSteps, VERIFICATION_CODE_VALID_TIME_IN_MILISECONDS } from "../util/consts";
import mongoose from "mongoose";
import crypto from "crypto";
import { getSampleById } from "./sample.service";
import { IParticipant } from "../interface/participant.interface";
import { findParticipantById } from "./participant.service";
import { issueSecondSourceAccessToken } from "./auth.service";
import { PartialDeep } from "type-fest";

interface FindSecondSourceByIdParams {
    participant: IParticipant;
    secondSourceId: string;
}

export function findSecondSourceById({ participant, secondSourceId }: FindSecondSourceByIdParams) {
    if (!mongoose.Types.ObjectId.isValid(secondSourceId)) {
        throw new Error("Participant id is invalid!");
    }

    const secondSource = participant.secondSources?.find((sSource) => sSource?._id?.toString() === secondSourceId);

    if (!secondSource) {
        throw new Error("Participant not found");
    }

    return secondSource;
}

interface FindSecondSourceByEmailParams {
    participant: IParticipant;
    secondSourceEmail: string;
}

export function findSecondSourceByEmail({ participant, secondSourceEmail }: FindSecondSourceByEmailParams) {
    const secondSource = participant.secondSources?.find(
        (sSource) => sSource?.personalData?.email === secondSourceEmail
    );

    return secondSource;
}

interface SendEmailVerificationParams {
    secondSourceEmail: string;
    participantId: string;
    sampleId: string;
}

export async function sendEmailVerification({
    secondSourceEmail,
    participantId,
    sampleId,
}: SendEmailVerificationParams) {
    const verificationCode = crypto.randomBytes(128).toString("hex");

    const { researcherDoc, sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    if (!participant?.adultForm?.endFillFormAt) {
        throw new Error("The participant hasn't finished the form.");
    }

    let secondSource = findSecondSourceByEmail({ participant: participant as IParticipant, secondSourceEmail });

    if (secondSource) {
        secondSource.verification = {
            code: verificationCode,
            generatedAt: new Date(),
        };
    } else {
        // New participant
        secondSource = {
            personalData: { email: secondSourceEmail },
            verification: {
                code: verificationCode,
                generatedAt: new Date(),
            },
        };

        if (!participant.secondSources) {
            participant.secondSources = [];
        }

        let arrLen = participant.secondSources.push(secondSource);
        secondSource = participant.secondSources[arrLen - 1]; // Get participant id
    }

    if (!secondSource._id) {
        throw new Error("Cannot send the verification email.");
    }

    await researcherDoc.save();

    dispatchSecondSourceVerificationEmail({
        secondSourceName: secondSource?.personalData?.fullName,
        secondSourceEmail,
        verificationCode: verificationCode,
        participantId,
        sampleId,
        secondSourceId: secondSource._id,
    });

    return true;
}

interface ValidateEmailVerificationParams {
    secondSourceId: string;
    participantId: string;
    sampleId: string;
    code: string;
}

export async function validateEmailVerificationCode({
    secondSourceId,
    participantId,
    sampleId,
    code,
}: ValidateEmailVerificationParams) {
    const { sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ sample, participantId });

    let secondSource = findSecondSourceById({ participant: participant as IParticipant, secondSourceId });

    if (!secondSource?._id) {
        throw Error("Second source email not found.");
    }

    if (!secondSource.verification || !secondSource.verification.code || !secondSource.verification.generatedAt) {
        throw Error("Verification code not requested!");
    }

    if (secondSource.verification.code !== code) {
        throw Error("Invalid verification code!");
    }

    const codeGeneratedAtInMs = DateTime.fromJSDate(secondSource.verification.generatedAt).toMillis();
    const currentDateInMs = DateTime.now().toMillis();

    if (currentDateInMs - codeGeneratedAtInMs > VERIFICATION_CODE_VALID_TIME_IN_MILISECONDS) {
        throw Error("Verification code expired!");
    }

    return {
        token: issueSecondSourceAccessToken({ participantId, secondSourceId }),
        secondSource,
    };
}

interface SaveSecondSourceDataParams {
    secondSourceId: string;
    sampleId: string;
    participantId: string;
    secondSourceData: PartialDeep<ISecondSource>;
}

/**
 * The `saveSecondSourceData` function updates the personal data and startFillFormAt field of a second
 * source for a given sample and participant.
 * @param {SaveSecondSourceDataParams} params - Function parameters
 * @param {string} params.secondSourceId - Second source id to update the data
 * @param {string} params.sampleId - Id from research sample
 * @param {string} params.participantId - Id from the participant that owner the second source
 * @param {PartialDeep<ISecondSource>} params.secondSourceData - Second source data to save
 * @returns a boolean value of `true`.
 */
export async function saveSecondSourceData({
    secondSourceId,
    sampleId,
    participantId,
    secondSourceData,
}: SaveSecondSourceDataParams) {
    const { sample } = await getSampleById({ sampleId });
    const participant = findParticipantById({ participantId, sample });

    let secondSource = findSecondSourceById({ participant: participant as IParticipant, secondSourceId });
    if (secondSource.personalData?.email) {
        secondSourceData = {
            ...secondSourceData,
            personalData: {
                ...secondSourceData.personalData,
                // Using the email already registered in the database
                email: secondSource.personalData.email,
            },
        };
    }

    await ResearcherModel.findOneAndUpdate(
        {
            "researchSamples._id": sampleId,
            "researchSamples.participants._id": participantId,
            "researchSamples.participants.secondSources._id": secondSourceId,
        },
        {
            $set: {
                "researchSamples.$[sam].participants.$[part].secondSources.$[secSource].personalData":
                    secondSourceData.personalData,
                "researchSamples.$[sam].participants.$[part].secondSources.$[secSource].adultForm.startFillFormAt":
                    new Date(),
            },
        },
        {
            arrayFilters: [{ "sam._id": sampleId }, { "part._id": participantId }, { "secSource._id": secondSourceId }],
        }
    );

    return true;
}

export async function acceptAllSampleDocs(sampleId: string, participantId: string, secondSourceId: string) {
    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        throw new Error("Sample id is invalid.");
    }

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
        throw new Error("Participant id is invalid.");
    }

    if (!mongoose.Types.ObjectId.isValid(secondSourceId)) {
        throw new Error("Second source id is invalid.");
    }

    const researcherDoc = await ResearcherModel.findOne({
        "researchSamples.participants.secondSources._id": secondSourceId,
    });

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

    const secondSource = participant.secondSources?.find(
        (secondSource) => secondSource._id?.toString() === secondSourceId
    );

    if (!secondSource) {
        throw new Error("Second source not found.");
    }

    if (sample.researchCep.taleDocument) {
        secondSource.acceptTaleIn = new Date();
    }

    if (sample.researchCep.tcleDocument) {
        participant.acceptTcleIn = new Date();
    }

    // Second step finished. Set the next step
    secondSource.adultFormCurrentStep = EAdultFormSteps.GENERAL_CHARACTERISTICS;

    await researcherDoc.save();

    return true;
}
