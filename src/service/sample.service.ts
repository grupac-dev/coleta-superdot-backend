import { Page } from "../interface/page.interface";
import ISample from "../interface/sample.interface";
import ResearcherModel from "../model/researcher.model";

export async function createSample(researcherId: string, sampleData: ISample): Promise<ISample> {
    const researcher = await ResearcherModel.findById(researcherId);

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    if (sampleData.qtt_participants_authorized) {
        throw new Error("Cannot create a sample with the quantity participants authorized set.");
    }

    sampleData.status = "Pendente";

    researcher.research_samples?.push(sampleData);

    await researcher.save();

    return sampleData;
}

export async function paginateResearcherSamples(researcherId: string, currentPage: number, itemsPerPage: number) {
    const researcher = await ResearcherModel.findById(researcherId, { research_samples: true })
        .limit(itemsPerPage * currentPage)
        .skip((currentPage - 1) * itemsPerPage)
        .exec();

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    return {
        samples: researcher.research_samples,
        totalSamples: researcher.research_samples?.length || 0,
    };
}

export async function paginateAllSamples(
    currentResearcherId: string,
    currentPage: number,
    itemsPerPage: number,
    filterStatus: string | undefined
) {
    const page = await ResearcherModel.aggregate<Page>()
        .match({ _id: { $ne: currentResearcherId } })
        .unwind("$research_samples")
        .match(filterStatus ? { "research_samples.status": filterStatus } : {})
        .project({
            researcher_id: "$_id",
            _id: 0,
            sample_id: "$research_samples._id",
            sample_name: "$research_samples.sample_title",
            researcher_name: "$personal_data.full_name",
            cep_code: "$research_samples.research_cep.cep_code",
            qtt_participants_requested: "$research_samples.qtt_participants_requested",
            qtt_participants_authorized: "$research_samples.qtt_participants_authorized",
            currentStatus: "$research_samples.status",
            files: {
                research_document: "$research_samples.research_cep.research_document",
                tcle_document: "$research_samples.research_cep.tcle_document",
                tale_document: "$research_samples.research_cep.tale_document",
            },
        })
        .facet({
            pagination: [{ $count: "totalItems" }, { $addFields: { page: currentPage } }],
            data: [{ $skip: (currentPage - 1) * itemsPerPage }, { $limit: itemsPerPage * currentPage }],
        })
        .unwind("$pagination")
        .exec();

    if (!page) {
        throw new Error("Any sample request was created yet.");
    }

    if (page.length !== 1) {
        throw new Error("Unknown error occurred in sample service.");
    }

    return page[0];
}
