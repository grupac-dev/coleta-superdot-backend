import { Request, Response } from "express";
import * as SampleService from "../service/sample.service";
import ISample from "../interface/sample.interface";
import { CreateSampleDTO, PaginateSampleDTO, paginateSampleParams } from "../dto/sample.dto";

export async function createSampleHandler(req: Request<{}, {}, CreateSampleDTO["body"], {}>, res: Response) {
    try {
        const researcherId = res.locals.session?.researcher_id;

        if (!researcherId) {
            throw new Error("Invalid session!");
        }

        const sampleData: ISample = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (files) {
            Object.keys(files).forEach((key) => {
                console.log(key);
                if (key === "research_cep[research_document]") {
                    sampleData.research_cep.research_document = files[key][0].filename;
                } else if (key === "research_cep[tcle_document]") {
                    sampleData.research_cep.tcle_document = files[key][0].filename;
                } else if (key === "research_cep[tale_document]") {
                    sampleData.research_cep.tale_document = files[key][0].filename;
                }
            });
        }

        const sampleCreated = await SampleService.createSample(researcherId, sampleData);

        res.status(200).json(sampleCreated);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).json(e.message);
    }
}

export async function paginateResearcherSamples(req: Request<PaginateSampleDTO["params"], {}, {}, {}>, res: Response) {
    try {
        const researcher_id = res.locals.session?.researcher_id;

        if (!researcher_id) {
            throw new Error("Invalid session!");
        }

        const currentPage = Number(req.params.currentPage);
        const itemsPerPage = Number(req.params.itemsPerPage || 10);

        const page = await SampleService.paginateResearcherSamples(researcher_id, currentPage, itemsPerPage);

        res.status(200).json(page);
    } catch (e) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).json(e);
    }
}

export async function paginateAllSamples(
    req: Request<PaginateSampleDTO["params"], {}, {}, PaginateSampleDTO["query"]>,
    res: Response
) {
    try {
        const researcher_id = res.locals.session?.researcher_id;

        if (!researcher_id) {
            throw new Error("Invalid session!");
        }

        const currentPage = Number(req.params.currentPage);
        const itemsPerPage = Number(req.params.itemsPerPage || 10);

        const page = await SampleService.paginateAllSamples(researcher_id, currentPage, itemsPerPage, req.query.status);

        res.status(200).json(page);
    } catch (e) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).json(e);
    }
}
