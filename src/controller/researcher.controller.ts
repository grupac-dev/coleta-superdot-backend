import { Request, Response } from "express";
import { updateResearcher } from "../service/researcher.service";
import { hashContent } from "../util/hash";
import IResearcher from "../interface/researcher.interface";
import { UpdateResearcherDTO } from "../dto/researcher.dto";
import { get } from "lodash";

export async function updateResearcherHandler(req: Request<{}, {}, UpdateResearcherDTO["body"], {}>, res: Response) {
    try {
        const newResearcherData: IResearcher = req.body;

        if (req.body.password) {
            newResearcherData.password_hash = hashContent(req.body.password);
        }

        const researcherId = get(res.locals, "session.researcher_id");

        if (!researcherId) {
            throw new Error("Invalid session!");
        }

        const researcherUpdated = await updateResearcher({ _id: researcherId }, newResearcherData);

        res.status(200).json(researcherUpdated);
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}
