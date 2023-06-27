import { Request, Response } from "express";
import { validatePassword } from "../service/researcher.service";
import { CreateSessionDTO } from "../dto/createSession.dto";
import * as SessionService from "../service/session.service";
import { Types } from "mongoose";
import { get } from "lodash";
import createHttpError from "http-errors";

export async function createSessionHandler(
    req: Request<{}, {}, CreateSessionDTO["body"], {}>,
    res: Response
) {
    const researcher = await validatePassword(req.body);

    if (!researcher) {
        return res.status(401).send("Invalid email or password");
    }

    const session = await SessionService.createSession(
        new Types.ObjectId(get(researcher, "_id")),
        req.get("user-agent") || ""
    );

    const accessToken = SessionService.issueAccessToken(session);
    const refreshToken = SessionService.issueRefreshToken(session);

    res.status(201).json({ accessToken, refreshToken });
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = get(res.locals, "session._id");

    if (!sessionId) {
        throw createHttpError(403, "Invalid session");
    }
    await SessionService.updateSession({ _id: sessionId }, { valid: false });
    res.status(200).json({ accessToken: null, refreshToken: null });
}
