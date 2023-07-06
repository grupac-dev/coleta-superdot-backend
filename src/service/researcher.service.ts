import { FilterQuery, QueryOptions, Types, UpdateQuery } from "mongoose";
import IResearcher from "../interface/researcher.interface";
import ResearcherModel from "../model/researcher.model";
import { omit } from "lodash";
import { compareHashes } from "../util/hash";

export async function createResearcher(researcherData: IResearcher): Promise<IResearcher> {
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
    update: UpdateQuery<IResearcher>,
    options: QueryOptions = {}
): Promise<IResearcher> {
    try {
        const researcherUpdated = await ResearcherModel.findOneAndUpdate(query, update, options).exec();

        if (!researcherUpdated) {
            throw new Error("Researcher is not found");
        }

        return omit(researcherUpdated.toJSON(), "password_hash");
    } catch {
        throw new Error("Is not possible updated Researcher");
    }
}

export async function deleteResearcher(researcherId: Types.ObjectId): Promise<IResearcher> {
    try {
        const researcherDeleted = await ResearcherModel.findByIdAndDelete(researcherId).exec();
        if (!researcherDeleted) {
            throw new Error("Researcher is not found");
        }
        return omit(researcherDeleted.toJSON(), "password_hash");
    } catch {
        throw new Error("Is not possible delete Researcher");
    }
}

export async function paginateResearchers(
    currentPage: number,
    itemsPerPage: number,
    filter: { user_name?: string; user_email?: string },
    currentResearcherId: string
) {
    try {
        const query = ResearcherModel.find(
            {
                $and: [
                    filter.user_name ? { "personal_data.full_name": RegExp(filter.user_name, "i") } : {},
                    filter.user_email ? { email: RegExp(filter.user_email, "i") } : {},
                ],
            },
            {
                "personal_data.full_name": true,
                email: true,
            }
        )
            .where("_id")
            .ne(currentResearcherId)
            .limit(itemsPerPage * currentPage)
            .skip((currentPage - 1) * itemsPerPage);

        const researchers = await query.exec();

        const totalResearchers = await ResearcherModel.countDocuments(query);

        return {
            researchers,
            totalResearchers,
        };
    } catch (error) {
        console.error(error);
        throw new Error("Cannot paginate researchers.");
    }
}

export async function findResearcher(query: FilterQuery<IResearcher>): Promise<IResearcher> {
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

    const isValid = await compareHashes(password, researcher.password_hash || "");

    if (!isValid) {
        return false;
    }

    return omit(researcher.toJSON(), "password_hash");
}

export async function getResearcherRole(id: string): Promise<string | undefined> {
    try {
        const researcher = await ResearcherModel.findById(id, { role: true }).lean().exec();
        if (!researcher) {
            throw new Error("Researcher not found");
        }
        console.log(researcher);
        return researcher.role;
    } catch (error) {
        console.error(error);
        throw new Error("Unknown error");
    }
}
