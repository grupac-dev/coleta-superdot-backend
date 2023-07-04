import { Request, Response } from "express";
import { ResearcherDTO } from "../dto/researcher.dto";
import * as ResearcherService from "../service/researcher.service";
import * as SessionService from "../service/session.service";
import { hashContent } from "../util/hash";
import IResearcher from "../interface/researcher.interface";
import { UpdateResearcherDTO } from "../dto/researcher.dto";
import { get } from "lodash";
import { DateTime } from "luxon";
import env from "../util/validateEnv";
import { Types } from "mongoose";
import { LoginDTO } from "../dto/login.dto";
import ISession from "../interface/session.interface";

export async function registerHandler(req: Request<{}, {}, ResearcherDTO["body"], {}>, res: Response) {
    try {
        let researcherData: IResearcher = req.body;

        if (req.file) {
            researcherData.personal_data.profile_photo = req.file.filename;
        }

        researcherData.role = env.DEFAULT_APP_ROLE;

        researcherData.password_hash = hashContent(req.body.password);

        const researcherCreated = await ResearcherService.createResearcher(researcherData);

        const session = await SessionService.createSession(
            new Types.ObjectId(get(researcherCreated, "_id")),
            req.get("user-agent") || ""
        );

        const accessToken = SessionService.issueAccessToken(session);
        const refreshToken = SessionService.issueRefreshToken(session);

        res.status(200).json({ accessToken, refreshToken });
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function loginHandler(req: Request<{}, {}, LoginDTO["body"], {}>, res: Response) {
    try {
        const researcher = await ResearcherService.validatePassword(req.body);

        if (!researcher) {
            return res.status(401).send("Invalid email or password");
        }

        const session = await SessionService.createSession(
            new Types.ObjectId(get(researcher, "_id")),
            req.get("user-agent") || ""
        );

        const accessToken = SessionService.issueAccessToken(session);
        const refreshToken = SessionService.issueRefreshToken(session);

        res.status(200).json({ accessToken, refreshToken });
    } catch (e: any) {
        console.log(e);

        // TO DO errors handlers
        res.status(409).send(e.message);
    }
}

export async function isValidSession(req: Request, res: Response) {
    try {
        const session = await SessionService.findSessionById(get(res.locals, "session"));
        console.log(session);

        res.status(200).json({ valid: session?.valid });
    } catch (e) {
        console.error(e);
        res.status(200).json({ valid: false });
    }
}
