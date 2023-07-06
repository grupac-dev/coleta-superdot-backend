import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { getResearcherRole } from "../service/researcher.service";

export const requireRole =
    (roleRequired: "Revisor" | "Administrador") => async (req: Request, res: Response, next: NextFunction) => {
        try {
            const researcherRole = await getResearcherRole(res.locals.session?.researcher_id || "");
            if (researcherRole !== roleRequired) {
                return res.status(403).send("This resource is only available to " + roleRequired);
            }
            next();
        } catch (error) {
            res.status(403).send("This resource is only available to " + roleRequired);
        }
    };
