import { Types } from "mongoose";
import IResearcher from "../interface/researcher.interface";
import ResearcherModel from "../model/researcher.model";
import { omit } from "lodash";

export async function createResearcher(
    researcherData: IResearcher
): Promise<IResearcher> {
    try {
        const researcher = await ResearcherModel.create(researcherData);
        return omit(researcher, "password_hash").toJSON();
    } catch {
        throw new Error("Is not possible create Researcher Data");
    }
}

export async function updateResearcher(
    researcherData: IResearcher
): Promise<IResearcher> {
    if (!researcherData._id) {
        throw new Error("Id is not defined");
    }
    try {
        const researcherUpdated = await ResearcherModel.findByIdAndUpdate(
            researcherData._id,
            researcherData,
            { returnDocument: "after" }
        ).exec();
        if (!researcherUpdated) {
            throw new Error("Researcher is not found");
        }
        return omit(researcherUpdated, "password_hash").toJSON();
    } catch {
        throw new Error("Is not possible updated Researcher");
    }
}

export async function deleteResearcher(
    researcherId: Types.ObjectId
): Promise<IResearcher> {
    try {
        const researcherDeleted = await ResearcherModel.findByIdAndDelete(
            researcherId
        ).exec();
        if (!researcherDeleted) {
            throw new Error("Researcher is not found");
        }
        return omit(researcherDeleted, "password_hash").toJSON();
    } catch {
        throw new Error("Is not possible delete Researcher");
    }
}

export async function findByEmail(email: string): Promise<IResearcher> {
    try {
        const researcher = await ResearcherModel.findOne({ email }).exec();
        if (!researcher) {
            throw new Error("Researcher is not found");
        }
        return omit(researcher, "password_hash").toJSON();
    } catch {
        throw new Error("Is not possible found Researcher");
    }
}

export async function findById(Id: Types.ObjectId): Promise<IResearcher> {
    try {
        const researcher = await ResearcherModel.findById(Id);
        if (!researcher) {
            throw new Error("Researcher is not found");
        }
        return omit(researcher, "password_hash").toJSON();
    } catch {
        throw new Error("Is not possible found Researcher");
    }
}
