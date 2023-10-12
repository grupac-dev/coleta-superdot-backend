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

interface SecondSourceByEmail {
    sampleId: string;
    participantId: string;
    data: ISecondSource;
}

export async function getSecondSourceByEmailAndParticipantId(email: string, participantId: string) {
    const secondSource = await ResearcherModel.aggregate<SecondSourceByEmail>()
        .match({
            "researchSamples.participants.secondSources.personalData.email": email,
            "researchSamples.participants._id": new mongoose.Types.ObjectId(participantId),
        })
        .unwind("$researchSamples")
        .unwind("$researchSamples.participants")
        .unwind("$researchSamples.participants.secondSources")
        .match({
            "researchSamples.participants.secondSources.personalData.email": email,
            "researchSamples.participants._id": new mongoose.Types.ObjectId(participantId),
        })
        .project({
            _id: false,
            sampleId: "$researchSamples._id",
            participantId: "$researchSamples.participants._id",
            data: "$researchSamples.participants.secondSources",
        });

    if (secondSource.length > 1) {
        throw new Error("Second sources with email duplication.");
    } else if (secondSource.length === 0) {
        return undefined;
    }

    return secondSource[0];
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

interface CodeValidated {
    participantToken: string;
    adultFormStepToReturn?: number;
}

export async function validateVerificationCode(
    secondSourceEmail: string,
    participantId: string,
    code: number
): Promise<CodeValidated> {
    const session = await ParticipantSessionModel.findOne(
        { participantEmail: secondSourceEmail, validSession: true },
        { validationCode: 1, createdAt: 1 }
    );

    if (!session) {
        throw Error("This participant haven't a active session.");
    }

    if (session.validationCode !== code) {
        throw Error("Invalid validation code.");
    }

    if (!session.createdAt) {
        throw Error("Invalid participant session.");
    }

    const sessionCreatedAtInMs = DateTime.fromISO(session.createdAt).toMillis();
    const currentDateInMs = DateTime.now().toMillis();

    if (currentDateInMs - sessionCreatedAtInMs > SESSION_VALID_TIME_IN_MILISECONDS) {
        throw Error("Verification code expired!");
    }

    const secondSource = await getSecondSourceByEmailAndParticipantId(secondSourceEmail, participantId);

    return {
        participantToken: issueParticipantToken(secondSourceEmail, secondSource?.data._id),
        adultFormStepToReturn: secondSource?.data.adultFormCurrentStep || EAdultFormSteps.PARTICIPANT_DATA,
    };
}

export async function saveSecondSourceData(sampleId: string, participantId: string, secondSourceData: ISecondSource) {
    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        throw new Error("Sample id is invalid.");
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

    // First step finished. Set the next step
    secondSourceData.adultFormCurrentStep = EAdultFormSteps.READ_AND_ACCEPT_DOCS;

    const secondSourceIndicated = participant.secondSources?.find(
        (secondSource) =>
            secondSource.personalData.email === secondSourceData.personalData.email && secondSource.indicated
    );

    if (secondSourceIndicated) {
        participant.secondSources?.every(async (secondSource) => {
            if (secondSource._id === secondSourceIndicated._id) {
                await ResearcherModel.updateOne(
                    { "researchSamples.participants.secondSources._id": secondSourceIndicated._id },
                    {
                        $set: {
                            "researchSamples.$[].participants.$[partDoc].secondSources.$[secSource].personalData":
                                secondSourceData.personalData,
                            "researchSamples.$[].participants.$[partDoc].secondSources.$[secSource].adultFormCurrentStep":
                                secondSourceData.adultFormCurrentStep,
                            "researchSamples.$[].participants.$[partDoc].secondSources.$[secSource].startFillFormDate":
                                new Date(),
                        },
                    },
                    {
                        // https://thecodebarbarian.com/a-nodejs-perspective-on-mongodb-36-array-filters
                        arrayFilters: [
                            { "partDoc._id": participant._id },
                            { "secSource._id": secondSourceIndicated._id },
                        ],
                    }
                );
                return false; // End loop
            } else return true; // Continue loop
        });

        return issueParticipantToken(secondSourceIndicated.personalData.email, secondSourceIndicated?._id);
    }

    secondSourceData.startFillFormDate = new Date().toISOString();

    participant.secondSources?.push(secondSourceData);

    await researcherDoc.save();

    const secondSourceCreated = participant.secondSources?.find(
        (participant) => participant.personalData.email === secondSourceData.personalData.email
    );

    if (!secondSourceCreated || !secondSourceCreated._id) {
        throw new Error("The SecondSource object was not created.");
    }

    return issueParticipantToken(secondSourceCreated.personalData.email, secondSourceCreated?._id);
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
