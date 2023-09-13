import mongoose from "mongoose";
import ResearcherModel from "../model/researcher.model";
import ParticipantSessionModel from "../model/participantSession.model";
import * as EmailUtils from "../util/emailSender.util";
import { DateTime } from "luxon";
import { EAdultFormSteps, SESSION_VALID_TIME_IN_MILISECONDS } from "../util/consts";
import { signJwt } from "../util/jwt";
import env from "../util/validateEnv";
import { IParticipant } from "../interface/participant.interface";
import { ISecondSource } from "../interface/secondSource.interface";
import { EmailAlreadyRegisteredError, ObjectNotExists } from "../error/participant.error";

const TO_GET_SIX_DIGITS_CODE = 1000000;

export async function validateEmail(participantEmail: string, sampleId: string, startFilling: boolean) {
    const { participant } = await getParticipantByEmail(participantEmail, sampleId);

    if (startFilling && participant) {
        throw new EmailAlreadyRegisteredError("Email already registered!");
    }

    if (!startFilling && !participant) {
        throw new ObjectNotExists("Participant not exists!");
    }

    const validationCode = Math.round(Math.random() * TO_GET_SIX_DIGITS_CODE);

    // Destroy all participant sessions
    await ParticipantSessionModel.updateMany({ participantEmail }, { validSession: false });

    await ParticipantSessionModel.create({
        participantEmail,
        validationCode,
        validSession: true,
    });

    EmailUtils.dispatchParticipantVerificationEmail({
        participantName: participant?.personalData.fullName,
        participantEmail,
        verificationCode: validationCode,
    });

    return true;
}

interface CodeValidated {
    participantToken: string;
    adultFormStepToReturn?: number;
}

export async function validateVerificationCode(
    participantEmail: string,
    sampleId: string,
    code: number,
    startFilling: boolean
): Promise<CodeValidated> {
    const session = await ParticipantSessionModel.findOne(
        { participantEmail, validSession: true },
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

    const { participant } = await getParticipantByEmail(participantEmail, sampleId);
    const participantId = participant?._id;

    return {
        participantToken: issueParticipantToken(participantEmail, participantId),
        adultFormStepToReturn: participant?.adultFormCurrentStep,
    };
}

export function issueParticipantToken(participantEmail: string, participantId?: string) {
    return signJwt(
        {
            participantId,
            participantEmail,
        },
        "ACCESS_TOKEN_PRIVATE_KEY",
        {
            expiresIn: env.PARTICIPANT_TOKEN_TTL,
        }
    );
}

export async function getParticipantByEmail(email: string, sampleId: string) {
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

    const participantWithSameEmail = sample.participants?.find(
        (participant) => participant.personalData.email === email
    );

    return { researcherDoc, participant: participantWithSameEmail };
}

export async function saveParticipantData(sampleId: string, participantData: IParticipant): Promise<string> {
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

    const participantWithSameEmail = sample.participants?.find(
        (participant) => participant.personalData.email === participantData.personalData.email
    );

    if (participantWithSameEmail) {
        throw new EmailAlreadyRegisteredError("Email already registered.");
    }

    // First step finished. Set the next step
    participantData.adultFormCurrentStep = EAdultFormSteps.READ_AND_ACCEPT_DOCS;

    sample.participants?.push(participantData);

    await researcherDoc.save();

    const participantCreated = sample.participants?.find(
        (participant) => (participant.personalData.email = participantData.personalData.email)
    );

    if (!participantCreated || !participantCreated._id) {
        throw new Error("The participant participant object was not created.");
    }

    return issueParticipantToken(participantCreated.personalData.email, participantCreated?._id);
}

export async function acceptAllSampleDocs(sampleId: string, participantId: string) {
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

    if (sample.researchCep.taleDocument) {
        participant.acceptTale = true;
    }

    if (sample.researchCep.tcleDocument) {
        participant.acceptTcle = true;
    }

    // Second step finished. Set the next step
    participant.adultFormCurrentStep = EAdultFormSteps.INDICATE_SECOND_SOURCE;

    await researcherDoc.save();

    return true;
}

export async function saveSecondSources(sampleId: string, participantId: string, secondSources: ISecondSource[]) {
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

    secondSources.forEach((secondSource) => {
        const secondSourceWithSameEmail = participant.secondSources?.find(
            (secondSourceRegistered) => secondSourceRegistered.personalData.email === secondSource.personalData.email
        );

        if (secondSourceWithSameEmail) {
            throw new Error("Email already registered to other second source.");
        }

        participant?.secondSources?.push({ ...secondSource, indicated: true });
    });

    // Second step finished. Set the next step
    participant.adultFormCurrentStep = EAdultFormSteps.GENERAL_CHARACTERISTICS;

    await researcherDoc.save();

    /** SEDING EMAIL */
    secondSources.forEach((secondSource) => {
        EmailUtils.dispatchSecondSourceIndicationEmail({
            participantName: participant.personalData.fullName,
            participantEmail: participant.personalData.email,
            secondSourceName: secondSource.personalData.fullName,
            secondSourceEmail: secondSource.personalData.email,
            participantId: participantId,
            sampleId: sampleId,
        });
    });

    return true;
}
export async function saveAutobiography(
    sampleId: string,
    participantId: string,
    autobiographyVideo?: string,
    autobiographyText?: string
) {
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

    if (!autobiographyText?.length && !autobiographyVideo?.length) {
        throw new Error("Autobiography text or video is required!");
    }

    participant.autobiography = {
        text: autobiographyText,
        videoUrl: autobiographyVideo,
    };

    // Set the next step
    participant.adultFormCurrentStep = EAdultFormSteps.FINISHED;

    participant.endFillFormDate = new Date();

    await researcherDoc.save();

    return true;
}
