import IResearcher from "../interface/researcher.interface";
import ISample from "../interface/sample.interface";
import ResearcherModel from "../model/researcher.model";

export async function createSample(researcherId: string, sampleData: ISample): Promise<ISample> {
    const researcher = await ResearcherModel.findById(researcherId);

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    if (sampleData.qtt_participantes_authorized) {
        throw new Error("Cannot create a sample with the quantity participants authorized set.");
    }

    sampleData.status = "Pendente";

    researcher.research_samples?.push(sampleData);

    await researcher.save();

    return sampleData;
}

export async function paginateSamples(researcherId: string, currentPage: number, itemsPerPage: number) {
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
