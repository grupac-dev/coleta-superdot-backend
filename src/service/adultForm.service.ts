import ResearcherModel from "../model/researcher.model";
import { IParticipant } from "../interface/participant.interface";
import { signJwt } from "../util/jwt";
import env from "../util/validateEnv";
import mongoose from "mongoose";

export async function createParticipant(sampleId: string, participantData: IParticipant): Promise<string> {
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
        throw new Error("Email already registered.");
    }

    sample.participants?.push(participantData);

    await researcherDoc.save();

    const participantCreated = sample.participants?.find(
        (participant) => (participant.personalData.email = participantData.personalData.email)
    );

    if (!participantCreated || !participantCreated._id) {
        throw new Error("The participant participant object was not created.");
    }

    return issueParticipantToken(participantCreated?._id);
}

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

export async function acceptDocs(sampleId: string, participantId: string) {
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

    if (sample.researchCep.taleDocument) {
        participant.acceptTale = true;
    }

    if (sample.researchCep.tcleDocument) {
        participant.acceptTcle = true;
    }

    await researcherDoc.save();

    return true;
}
