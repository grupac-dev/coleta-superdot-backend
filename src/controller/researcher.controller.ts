import { Request, Response } from "express";
import { CreateResearcherDTO } from "../dto/createResearcher.dto";
import {
    createResearcher,
    updateResearcher,
} from "../service/researcher.service";
import { hashContent } from "../util/hash";
import IResearcher from "../interface/researcher.interface";
import { UpdateResearcherDTO } from "../dto/updateResearcher.dto";
import { get } from "lodash";

export async function createResearcherHandler(
    req: Request<{}, {}, CreateResearcherDTO["body"], {}>,
    res: Response
) {
    try {
        const researcherData: IResearcher = req.body;
        researcherData.password_hash = hashContent(req.body.password);

        const researcherCreated = await createResearcher(researcherData);

        res.status(201).json(researcherCreated);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function updateResearcherHandler(
    req: Request<{}, {}, UpdateResearcherDTO["body"], {}>,
    res: Response
) {
    try {
        const newResearcherData: IResearcher = req.body;
        if (req.body.password) {
            newResearcherData.password_hash = hashContent(req.body.password);
        }

        newResearcherData._id = get(
            res.locals,
            "current_session.researcher_id"
        );

        if (!newResearcherData._id) {
            throw new Error("Invalid session!");
        }

        const researcherUpdated = await updateResearcher(newResearcherData);

        res.status(200).json(researcherUpdated);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
