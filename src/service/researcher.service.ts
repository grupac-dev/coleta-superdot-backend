import { FilterQuery, Types, UpdateQuery } from "mongoose";
import IResearcher from "../interface/researcher.interface";
import ResearcherModel from "../model/researcher.model";
import { omit } from "lodash";
import { compareHashes } from "../util/hash";

export async function createResearcher(
    researcherData: IResearcher
): Promise<IResearcher> {
    try {
        const researcher = await ResearcherModel.create(researcherData);
        return omit(researcher.toJSON(), "password_hash");
    } catch (e: any) {
        console.error(e);
        throw new Error("Is not possible create Researcher Data");
    }
}

export async function updateResearcher(
    query: FilterQuery<IResearcher>,
    update: UpdateQuery<IResearcher>
): Promise<IResearcher> {
    try {
        const researcherUpdated = await ResearcherModel.findOneAndUpdate(
            query,
            update,
            {
                new: true,
            }
        ).exec();

        if (!researcherUpdated) {
            throw new Error("Researcher is not found");
        }

        return omit(researcherUpdated.toJSON(), "password_hash");
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
        return omit(researcherDeleted.toJSON(), "password_hash");
    } catch {
        throw new Error("Is not possible delete Researcher");
    }
}

export async function findResearcher(
    query: FilterQuery<IResearcher>
): Promise<IResearcher> {
    try {
        const researcher = await ResearcherModel.findOne(query).lean().exec();
        if (!researcher) {
            throw new Error("Researcher is not found");
        }
        return omit(researcher, "password_hash");
    } catch {
        throw new Error("Is not possible found Researcher");
    }
}

export async function validatePassword({
    email,
    password,
}: {
    email: string;
    password: string;
}): Promise<IResearcher | Boolean> {
    const researcher = await ResearcherModel.findOne({ email });

    if (!researcher) {
        return false;
    }

    const isValid = await compareHashes(
        password,
        researcher.password_hash || ""
    );

    if (!isValid) {
        return false;
    }

    return omit(researcher.toJSON(), "password_hash");
}
