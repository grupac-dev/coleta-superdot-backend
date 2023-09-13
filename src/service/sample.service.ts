import mongoose from "mongoose";
import { Page } from "../interface/page.interface";
import ISample from "../interface/sample.interface";
import ResearcherModel from "../model/researcher.model";
import { ISampleParticipantSummay } from "../interface/sampleParticipantSummary";
import { EAdultFormSteps, TParticipantFormProgress } from "../util/consts";

export async function createSample(researcherId: string, sampleData: ISample): Promise<ISample> {
    const researcher = await ResearcherModel.findById(researcherId);

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    if (sampleData.qttParticipantsAuthorized) {
        throw new Error("Cannot create a sample with the quantity participants authorized set.");
    }

    sampleData.status = "Pendente";

    researcher.researchSamples?.push(sampleData);

    await researcher.save();

    return sampleData;
}

export async function editSample(researcherId: string, sampleId: string, newSampleData: ISample): Promise<Boolean> {
    const researcher = await ResearcherModel.findById(researcherId);

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    if (newSampleData.qttParticipantsAuthorized) {
        throw new Error("Cannot update the qttParticipantsAuthorized field.");
    }

    if (!researcher.researchSamples) {
        throw new Error("Research haven't samples.");
    }

    newSampleData.status = "Pendente";

    researcher.researchSamples = researcher.researchSamples.map((sample) => {
        if (sample._id?.toString() === sampleId) {
            if (!newSampleData.researchCep.researchDocument) {
                newSampleData.researchCep.researchDocument = sample.researchCep.researchDocument;
            }
            if (!newSampleData.researchCep.tcleDocument) {
                newSampleData.researchCep.tcleDocument = sample.researchCep.tcleDocument;
            }
            if (!newSampleData.researchCep.taleDocument) {
                newSampleData.researchCep.taleDocument = sample.researchCep.taleDocument;
            }

            return {
                ...newSampleData,
                _id: sampleId,
                sampleGroup: sample.sampleGroup,
                reviews: sample.reviews,
            };
        } else return sample;
    });

    await researcher.save();

    return true;
}

interface FilterPage {
    researchTitle: string;
    sampleTitle: string;
}

export async function paginateResearcherSamples(
    researcherId: string,
    currentPage: number,
    itemsPerPage: number,
    filters?: FilterPage
) {
    const researcher = await ResearcherModel.findById(researcherId, { researchSamples: true })
        .limit(itemsPerPage * currentPage)
        .skip((currentPage - 1) * itemsPerPage)
        .exec();

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    let samples = researcher.researchSamples;
    if (researcher.researchSamples) {
        samples = researcher.researchSamples.filter((sample) => {
            let returnElement = true;
            if (filters?.researchTitle) {
                returnElement = sample.researchTitle.includes(filters?.researchTitle);
            }
            if (filters?.sampleTitle) {
                returnElement = sample.sampleTitle.includes(filters?.sampleTitle);
            }
            return returnElement;
        });
    }

    return {
        data: samples,
        pagination: {
            totalItems: researcher.researchSamples?.length || 0,
            page: currentPage,
        },
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
        .unwind("$researchSamples")
        .match(filterStatus ? { "researchSamples.status": filterStatus } : {})
        .project({
            researcherId: "$_id",
            _id: 0,
            sampleId: "$researchSamples._id",
            sampleName: "$researchSamples.sampleTitle",
            researcherName: "$personalData.fullName",
            cepCode: "$researchSamples.researchCep.cepCode",
            qttParticipantsRequested: "$researchSamples.qttParticipantsRequested",
            qttParticipantsAuthorized: "$researchSamples.qttParticipantsAuthorized",
            currentStatus: "$researchSamples.status",
            files: {
                researchDocument: "$researchSamples.researchCep.researchDocument",
                tcleDocument: "$researchSamples.researchCep.tcleDocument",
                taleDocument: "$researchSamples.researchCep.taleDocument",
            },
        })
        .facet({
            pagination: [{ $count: "totalItems" }, { $addFields: { page: currentPage } }],
            data: [{ $skip: (currentPage - 1) * itemsPerPage }, { $limit: itemsPerPage * currentPage }],
        })
        .unwind("$pagination")
        .exec();

    console.log(page);

    if (!page) {
        throw new Error("Any sample request was created yet.");
    }

    if (!page.length) {
        return [];
    }

    // The query should return an array with a single element.
    if (page.length > 1) {
        throw new Error("Unknown error occurred in sample service.");
    }

    return page[0];
}

export async function deleteSample(currentResearcherId: string, sampleId: string) {
    const researcher = await ResearcherModel.findById(currentResearcherId, { researchSamples: true }).exec();

    if (!researcher) {
        throw new Error("Cannot find the researcher.");
    }

    if (!researcher.researchSamples) {
        throw new Error("Research haven't samples.");
    }

    const sampleToDelete = researcher.researchSamples.find((sample) => sample._id?.toString() === sampleId);

    if (!sampleToDelete) {
        throw new Error("Cannot find the research sample.");
    }

    if (sampleToDelete.status === "Autorizado") {
        throw new Error("Cannot delete a sample authorized.");
    }

    researcher.researchSamples = researcher.researchSamples.filter((sample) => sample._id?.toString() !== sampleId);

    await researcher.save();

    return true;
}

interface IRequiredDoc {
    jsonFileKey: string;
    backendFileName: string;
    label: string;
}

export async function getRequiredDocs(sampleId: string) {
    if (!mongoose.Types.ObjectId.isValid(sampleId)) {
        throw new Error("Sample id is invalid.");
    }

    const researcher = await ResearcherModel.findOne(
        { "researchSamples._id": sampleId },
        {
            "researchSamples._id": 1,
            "researchSamples.researchCep.tcleDocument": 1,
            "researchSamples.researchCep.taleDocument": 1,
        }
    );

    if (!researcher || !researcher.researchSamples) {
        throw new Error("Sample not found!");
    }

    const sample = researcher.researchSamples.find((sample) => sample._id?.toString() === sampleId);

    if (!sample) {
        throw new Error("Sample not found!");
    }

    const docs: IRequiredDoc[] = [];

    if (sample.researchCep.taleDocument) {
        docs.push({
            jsonFileKey: "taleDocument",
            backendFileName: sample.researchCep.taleDocument,
            label: "Termo de Anuência Livre e Esclarecido",
        });
    }

    if (sample.researchCep.tcleDocument) {
        docs.push({
            jsonFileKey: "tcleDocument",
            backendFileName: sample.researchCep.tcleDocument,
            label: "Termo de Compromisso Livre e Esclarecido",
        });
    }

    return docs;
}

export async function getParticipantRegistrationProgress(
    sampleId: string
): Promise<ISampleParticipantSummay[] | undefined> {
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

    const summary = sample.participants?.map((participant) => {
        let progress: TParticipantFormProgress = "Aguardando 2ª fonte";
        if (participant.adultFormCurrentStep !== EAdultFormSteps.FINISHED) {
            progress = "Preenchendo";
        } else if (participant.secondSources?.length) {
            progress = "Finalizado";
        }

        return {
            sampleId: sample._id as string,
            participantId: participant._id as string,
            fullName: participant.personalData.fullName,
            progress,
            qttSecondSources: participant.secondSources?.length || 0,
            startDate: participant.createdAt as Date,
            endDate: participant.endFillFormDate,
            giftednessIndicators: participant.giftdnessIndicators,
        };
    });

    return summary;
}
